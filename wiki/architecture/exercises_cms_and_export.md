# CMS de Ejercicios Clínicos, Exportación CSV y PWA

## 1. CMS Ligero de Ejercicios Clínicos en Supabase

Para permitir a los administradores y terapeutas incorporar nuevas oraciones y categorías sin requerir despliegues de código ni reconstrucción de paquetes estáticos en Cloudflare Pages, se habilitó un CMS ligero sobre la tabla `public.exercises`.

### Arquitectura de Seguridad Zero Trust RLS:
- **Lectura Pública:** Permite a usuarios anónimos y registrados (`anon`, `authenticated`) consultar la lista de ejercicios oficiales para su entrenamiento diario.
- **Escritura Administrativa Estricta:** Las operaciones de creación (`INSERT`), actualización (`UPDATE`) y eliminación (`DELETE`) requieren que la función `current_user_is_admin()` o la política sobre `app_admins` evalúe a verdadero para el `auth.uid()`.

```sql
-- Políticas en supabase/migrations/20261028210000_exercise_cms_policies.sql
CREATE POLICY "exercises_admin_all_policy"
ON public.exercises
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.app_admins
    WHERE app_admins.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_admins
    WHERE app_admins.user_id = auth.uid()
  )
);
```

---

## 2. Exportación de Datos en Formato CSV

La consola de administración (`src/app/admin/page.tsx`) integra herramientas de exportación directa en formato CSV estandarizado para auditoría externa e integración con hojas de cálculo:

1. **Exportación de Reportes de Calidad (`cadensa_feedback_YYYY-MM-DD.csv`):**
   - Encabezados: `ID`, `Fecha`, `Categoria`, `Tecnica`, `Estado`, `Email_Contacto`, `Mensaje`.
   - Generado mediante `generateFeedbackCSV()` en `src/lib/adminService.ts`.
2. **Exportación del Directorio de Adherencia (`cadensa_usuarios_YYYY-MM-DD.csv`):**
   - Encabezados: `ID`, `Username`, `Nombre_Completo`, `Racha_Actual_Dias`, `Record_Racha`, `Minutos_Totales`, `XP_Puntos`, `Ultima_Actividad`.
   - Generado mediante `generateUsersCSV()` en `src/lib/adminService.ts`.

### Flujo de Descarga en el Cliente:
Los datos se serializan como texto plano CSV, se encapsulan en un `Blob([content], { type: 'text/csv;charset=utf-8;' })`, se genera un enlace transitorio mediante `URL.createObjectURL(blob)` y se dispara la descarga automática en el navegador.

---

## 3. Soporte PWA e Instalación Offline-First

Para facilitar la adopción móvil diaria:
- **Manifest:** Configurado en `public/manifest.json` con soporte `display: standalone`, colores de tema y metadatos médicos.
- **Service Worker:** En `public/sw.js` con estrategia *Network First* y caché de respaldo para archivos estáticos e interfaz SPA.
- **Botón de Instalación (`src/components/PwaInstallButton.tsx`):**
  - Captura el evento `beforeinstallprompt` del navegador.
  - Detecta si la aplicación ya se ejecuta en modo `standalone`.
  - Muestra un botón ergonómico *"📲 Instalar App"* en la barra de navegación para añadir Cadensa a la pantalla de inicio con 1 clic.
