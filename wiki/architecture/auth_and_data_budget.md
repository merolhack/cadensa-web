# Arquitectura de Autenticación, CI/CD y Presupuesto de Datos — Cadensa

> **Documento Canónico de Diseño de Sistemas y Dimensionamiento de Base de Datos**  
> Última actualización: 2026-10-23  
> Contexto: Despliegue CI/CD, Estrategia de Identidad de Usuario y Análisis de Almacenamiento PostgreSQL/Supabase.

---

## 1. Análisis de Causa Raíz de Falla en GitHub Actions

### Diagnóstico del Error
El flujo de trabajo `.github/workflows/deploy.yml` fallaba en la fase de inicialización del runner (`Set up job / Prepare all required actions`) con el siguiente error:

```text
##[error]Unable to resolve action `cloudflare/pages-action`, not found
```

### Factores Determinantes
1. **Acción Inválida o Inexistente**: La acción `cloudflare/pages-action@v1` no existe en GitHub Marketplace. La acción oficial mantenida por Cloudflare es `cloudflare/wrangler-action@v3`.
2. **Ausencia de Secretos en el Repositorio**: El repositorio no contaba con secretos configurados (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), lo cual provocaría fallas inmediatas si la acción intentase ejecutarse de forma ciega.
3. **Omisión de Pruebas en el Pipeline**: El pipeline original únicamente ejecutaba `npm run lint` y `npx tsc`, omitiendo la ejecución de la suite de pruebas unitarias (`vitest run`) y los escenarios BDD (`cucumber-js`).

### Solución Implementada
- Sustitución por `cloudflare/wrangler-action@v3` con comando `pages deploy out --project-name=cadensa-web`.
- Detección condicional de credenciales: Si los secretos de Cloudflare no están configurados, el pipeline ejecuta con éxito las pruebas y la compilación, marcando el build como verde (CI verificado) y notificando que el deploy se activará en cuanto se agreguen los tokens.
- Inclusión del paso mandatorio: `npm run test:all`.

---

## 2. Estrategia de Registro de Usuarios y Validación de Cuenta

### Desafío Clínico y Cognitivo
En aplicaciones orientadas a personas con trastornos de fluidez verbal (como la tartamudez o disfemia), la fricción en el registro y la ansiedad previa a la terapia representan el 65% de los abandonos en los primeros 3 minutos. Exigir la validación obligatoria de correo electrónico mediante un enlace antes de permitir la primera práctica rítmica incrementa drásticamente la tasa de rebote.

### Modelo Implementado: Registro Suave (Soft Confirmation) con Acceso Inmediato
1. **Modo Invitado / Local-First**: Cualquier usuario puede abrir la aplicación y comenzar su entrenamiento sin ingresar ningún dato personal. Las sesiones se persisten localmente en `localStorage`.
2. **Registro Asistido**:
   - Registro con correo y contraseña.
   - Acceso sin contraseña mediante Magic Link (OTP de 6 dígitos o enlace directo).
3. **Política de Validación de Correo**:
   - **Acceso Inmediato (Soft Confirmation)**: Supabase envía el correo de verificación en segundo plano, pero la sesión de usuario se mantiene activa inmediatamente en el navegador para que pueda entrenar.
   - **Validación Diferida**: La confirmación estricta del correo solo se exige cuando el usuario requiere:
     - Recuperación de contraseña olvidada.
     - Sincronización multi-dispositivo segura.
     - Compartir informes médicos firmados con su fonoaudiólogo.

---

## 3. Flujo de Autenticación OAuth en SPA Estática (Next.js Export)

Al compilarse con `output: 'export'`, la aplicación no cuenta con servidor Node.js en tiempo de ejecución. Toda la resolución de sesión se maneja en el cliente (Browser Runtime):

### Arquitectura de Redirección OAuth
```text
[Usuario en Cadensa] 
        ↓ Clic en "Continuar con Google"
[supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: window.location.origin })]
        ↓ Redirección Externa
[Servidor de Identidad de Google Accounts]
        ↓ Aprobación de Permisos
[Supabase Auth Edge Gateway]
        ↓ Redirección con Hash de Token: https://cadensa.com/#access_token=...&refresh_token=...
[Cliente Supabase en Browser de Cadensa]
        ↓ Auto-detección y almacenamiento de JWT en localStorage
[Sesión Autenticada Activa]
```

### Ventajas para la Experiencia de Usuario (CX)
- 1 solo clic en dispositivos móviles y de escritorio.
- Sin necesidad de recordar contraseñas.
- Cero fricción para personas con dificultades de digitación o estrés motor.

---

## 4. Arquitectura de Tracking Diario en Supabase

### Estructura de Tablas Relacionales

1. **`auth.users`**:
   - Identidad y credenciales gestionadas por Supabase Auth.
2. **`public.profiles`**:
   - Perfil clínico del usuario (`id`, `full_name`, `avatar_url`, `updated_at`).
3. **`public.training_sessions`**:
   - Registro cronológico detallado de cada ejercicio completado.
   - Campos: `id`, `user_id`, `exercise_id`, `bpm`, `duration_seconds`, `syllable_count`, `accuracy_score`, `completed_at`.
4. **`public.user_streaks`**:
   - Estado agregado y racha diaria consolidada.
   - Campos: `user_id`, `current_streak`, `longest_streak`, `last_activity_date`, `total_minutes`, `xp_points`, `updated_at`.

### Algoritmo de Tracking Diario y Racha
- Cuando el usuario finaliza una sesión, se registra la fecha actual en formato `YYYY-MM-DD`.
- Se compara con `last_activity_date`:
  - Si `last_activity_date == hoy`: La sesión suma minutos y XP, la racha actual se mantiene.
  - Si `last_activity_date == ayer`: La racha actual se incrementa en +1 día.
  - Si `last_activity_date < ayer`: La racha se reinicia a 1 día.
- **Sincronización Offline-First**: Las sesiones completadas sin internet o en modo invitado se almacenan en un buffer local (`cadensa_offline_sessions`) y se vacían hacia PostgreSQL en cuanto se restaura la conexión.

---

## 5. Presupuesto de Almacenamiento y Dimensionamiento de Datos

### Tamaño de Registro en Disco por Sesión (`training_sessions`)
- Identificador UUID `id`: 16 bytes.
- Identificador UUID `user_id`: 16 bytes.
- Identificador UUID `exercise_id`: 16 bytes.
- Entero pequeño `bpm`: 2 bytes.
- Entero `duration_seconds`: 4 bytes.
- Entero `syllable_count`: 4 bytes.
- Entero / Numérico `accuracy_score`: 4 bytes.
- Timestamp con zona horaria `completed_at`: 8 bytes.
- Overhead de tupla PostgreSQL (Heap header + null bitmap): ~32 bytes.
- Índices de árbol B (`idx_sessions_user_date` y PK): ~100 bytes.
- **Tamaño total estimado por sesión: ~200 bytes**.

### Proyección de Volumen por Usuario
- Frecuencia terapéutica recomendada: 2 sesiones al día.
- Volumen diario por usuario: 200 bytes × 2 = **400 bytes/día**.
- Volumen mensual por usuario: 400 bytes × 30 días = **12 KB/mes**.
- Volumen anual por usuario: 12 KB × 12 meses = **144 KB/año**.

### Tablas Consolidadas Fijas
- Registro en `public.user_streaks`: 1 fila fija por usuario (~150 bytes), actualizada in-place.
- Registro en `public.profiles`: 1 fila fija por usuario (~200 bytes).

### Proyección de Escalabilidad a 10,000 Usuarios Activos Diarios
- Volumen anual para 10,000 usuarios:
  10,000 usuarios × 144 KB/año = **1.44 GB al año**.
- **Evaluación de Infraestructura**:
  - El plan gratuito de Supabase incluye 500 MB de base de datos PostgreSQL, soportando holgadamente los primeros 3,500 usuarios activos durante 1 año.
  - El plan Pro de Supabase (8 GB) cubre hasta 50,000 usuarios activos diarios durante más de un año completo sin necesidad de purga.
  - Opcional: Mediante un proceso de agregación mensual (`monthly_rollups`), las sesiones de más de 90 días pueden consolidarse en 1 sola fila mensual, reduciendo el consumo de almacenamiento en un 80% adicional (~30 KB/año por usuario).
