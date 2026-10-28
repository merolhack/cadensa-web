# Arquitectura del Dashboard Privado y Gobierno Clínico (/admin)

> **Tipo:** Arquitectura y Seguridad  
> **Estado:** Implementado y Verificado  
> **Última Actualización:** 2026-10-28  
> **Etiquetas:** `admin`, `security`, `rbac`, `zero-trust`, `rls`, `dashboard`, `governance`

---

## 1. Contexto y Desafío de Seguridad en Jamstack Estático

Cadensa opera bajo el paradigma de exportación estática obligatoria (`output: 'export'`) en Next.js 16 sobre la red Anycast de Cloudflare Pages, sin servidores Node.js en tiempo de ejecución. 

En esta arquitectura:
1. **El código del cliente es público:** Las rutas del navegador pueden ser alcanzadas por cualquier usuario. Por lo tanto, un simple guard en React o condicional en cliente solo aporta experiencia de usuario (UX), no seguridad.
2. **Seguridad Absoluta en la Capa de Datos (Zero Trust RLS):** Toda autorización y restricción de acceso debe delegarse de forma ineludible a **PostgreSQL en Supabase**. Si un usuario sin privilegios accede a `/admin`, las consultas a la API de PostgREST retornan vacío (`[]`) o error de acceso denegado (`403 Forbidden`).

---

## 2. Modelo de Control de Acceso Basado en Roles (RBAC)

Para evitar ataques de escalada de privilegios y eliminar ciclos de recursión en las políticas RLS:

### A. Tabla Aislada de Administradores (`public.app_admins`)
```sql
CREATE TABLE public.app_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'clinical_director')),
  granted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo lectura del propio estado de admin"
ON public.app_admins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```
* **Protección contra autoasignación:** Los roles `anon` y `authenticated` no tienen permisos directos de escritura (`INSERT/UPDATE/DELETE`) sobre `public.app_admins`. Solo pueden asignarse mediante el `service_role` o scripts de migración administrativa.

### B. Función de Verificación (`public.is_admin()`)
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.app_admins
    WHERE user_id = auth.uid()
  );
END;
$$;
```
Al fijar `SECURITY DEFINER` y `SET search_path = public`, la función evalúa la membresía en `app_admins` con privilegios elevados de sistema sin caer en trampas de búsqueda de esquemas (`search_path poisoning`) y sin disparar políticas recursivas.

---

## 3. Módulos y Capacidades del Dashboard

La consola en `src/app/admin/page.tsx` está estructurada en 4 pestañas interactivas:

1. **Bandeja de Calidad y Moderación de Feedback:**
   * Lista en tiempo real de los reportes en `public.feedback_reports`.
   * Filtros dinámicos por categoría (`video_issue`, `technique_issue`, `suggestion`, `other`) y estado (`pending`, `reviewed`, `resolved`, `discarded`).
   * Acciones en un clic para marcar incidencias como revisadas, resueltas o descartadas.
2. **Directorio y Adherencia de Usuarios:**
   * Listado consolidado de perfiles (`profiles`) y rachas (`user_streaks`).
   * Visualización de días consecutivos de práctica, minutos acumulados de entrenamiento y puntos XP.
3. **Tráfico y Motores de Búsqueda:**
   * Integración de telemetría de 30 días de Google Analytics 4 (usuarios únicos, sesiones, vistas).
   * Rendimiento orgánico de Google Search Console (impresiones y clics).
   * Estado de cobertura de Bing Webmaster Tools e IndexNow.
   * Eficiencia de entrega en el Edge de Cloudflare (solicitudes y ratio de caché).
   * Distribución geográfica de los principales países de impacto.
4. **Diagnóstico Clínico y Calidad Operativa:**
   * Calibración del metrónomo silábico isocrónico (70 a 110 BPM).
   * Verificación del descargo médico fonoaudiológico (YMYL) y cumplimiento de `ads.txt` en AdSense.
   * Diagnóstico de procesamiento de voz Zero Trust en la Web Audio API (latencia estimada ≤ 15 ms).

---

## 4. Resiliencia de Red y Rendimiento en Cliente

El servicio [`src/lib/adminService.ts`](file:///src/lib/adminService.ts) implementa la función envoltorio `withNetworkTimeout`, la cual:
* Limita las consultas remotas a 1,200 ms mediante `Promise.race`.
* En caso de desconexión, falla temporal de red o ejecución en entornos de pruebas aislados (CI/CLI), retorna estructuras seguras de respaldo sin bloquear el renderizado ni provocar timeouts en los tests.
