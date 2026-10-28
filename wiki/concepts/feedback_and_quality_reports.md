# Retroalimentación Comunitaria y Reporte de Calidad Clínica (Zero-Leak RLS)

> **Tipo:** Concepto de Arquitectura y Calidad Clínica  
> **Estado:** Implementado y Verificado  
> **Última Actualización:** 2026-10-28  
> **Etiquetas:** `feedback`, `quality`, `clinical-telemetry`, `zero-trust`, `rls`, `offline-first`

---

## 1. Fundamento Fonoaudiológico y Dilema del Registro Obligatorio

En aplicaciones terapéuticas dirigidas a personas con tartamudez o disfemia, la experiencia de usuario debe minimizar cualquier factor estresante o de frustración:

1. **La Barrera del Abandono ante Errores:**
   Cuando un paciente experimenta un problema técnico durante su entrenamiento (por ejemplo, un video demostrativo que no reproduce sonido en su navegador o una instrucción fonética que le resulta ambigua), obligarle a crear una cuenta, verificar su correo y recordar una contraseña para reportar el problema genera un abandono inmediato (>70%).
2. **El Valor del Reporte en el Punto de Contacto:**
   Permitir que cualquier visitante o paciente envíe comentarios en menos de 10 segundos directamente desde el modal de video (`TechniqueVideoModal`) o desde las páginas de técnicas (`/tecnicas/[id]`) es vital para la mejora continua del material clínico.

---

## 2. Arquitectura de Seguridad: Patrón Blind-Drop (Zero-Leak RLS)

En aplicaciones estáticas desplegadas en la CDN de Cloudflare Pages (`output: 'export'`), la comunicación con Supabase se realiza directamente desde el navegador utilizando `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Para evitar filtraciones de datos privados o explotación de la base de datos, se implementó el patrón **Blind-Drop**:

### A. Esquema de Base de Datos (`public.feedback_reports`)
* `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
* `user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL`: Opcional para visitantes; se asocia automáticamente si hay sesión activa.
* `category text NOT NULL CHECK (category IN ('video_issue', 'technique_issue', 'suggestion', 'other'))`
* `technique_id text`: Identificador de la técnica contextual (ej. `sts`, `easy_onset`).
* `message text NOT NULL CHECK (length(message) >= 10 AND length(message) <= 1000)`
* `contact_email text CHECK (contact_email IS NULL OR contact_email ~* '...')`
* `metadata jsonb NOT NULL DEFAULT '{}'::jsonb`: Diagnóstico técnico seguro (resolución, user agent, URL, versión).
* `status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'discarded'))`
* `created_at timestamptz NOT NULL DEFAULT now()`

### B. Políticas Row Level Security (RLS)
* **Inserción Segura contra Suplantación:**
  ```sql
  CREATE POLICY "Permitir insercion con verificacion de identidad o anonimo"
  ON public.feedback_reports FOR INSERT TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL AND auth.uid() IS NULL) OR
    (user_id IS NULL AND auth.uid() IS NOT NULL) OR
    (user_id = auth.uid())
  );
  ```
* **Lectura Restringida (Blind-Drop Confidencial):**
  Los clientes anónimos (`anon`) tienen revocada cualquier lectura (`SELECT`). Los usuarios autenticados únicamente pueden consultar sus propios reportes (`auth.uid() = user_id`). Solo los administradores clínicos mediante el panel de Supabase o el rol de servicio pueden consultar y moderar todos los comentarios.

---

## 3. Defensas de Calidad en el Cliente (Client-Side Guards)

Para proteger la infraestructura de spam y abusos sin requerir CAPTCHAs invasivos que degraden la accesibilidad:

1. **Honeypot Invisible:**
   Se incluye un campo de texto oculto mediante atributos accesibles y CSS (`tabIndex={-1}`, `autoComplete="off"`, `className="hidden"`). Si un bot automatizado llena este campo, el servicio simula éxito sin persistir en la base de datos, neutralizando contramedidas del atacante.
2. **Control de Frecuencia (Rate Limiting Local):**
   El navegador almacena marcas de tiempo en `localStorage` (`cadensa_feedback_timestamps`). Se permite un máximo de 3 reportes por hora. Si se sobrepasa, el formulario se bloquea y calcula los minutos restantes de espera.
3. **Resiliencia Offline-First:**
   Si la conexión a internet falla o el servidor está inaccesible, el reporte se almacena en la cola local `cadensa_offline_feedback` y se notifica al usuario con un mensaje amigable, garantizando que su esfuerzo no se pierda.

---

## 4. Métricas y Telemetría GA4

Cada envío exitoso emite el evento fonoaudiológico:
* Evento: `feedback_submitted`
* Parámetros: `{ category: payload.category, technique_id: payload.techniqueId || 'none' }`
Permite correlacionar qué videos o técnicas presentan mayor tasa de incidencias reportadas en producción.
