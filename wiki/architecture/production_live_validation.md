# Validación Continua en Entorno Productivo Real (Cloudflare Pages)

> **Entorno**: `https://cadensa-web.pages.dev/`  
> **Servicios Evaluados**: Cloudflare Edge, Google Analytics 4 (`G-HCTT9146TJ`), Google OAuth 2.0 y Supabase PostgreSQL Zero Trust RLS  
> **Herramientas de Simulación**: Playwright Chromium Headless y Scripts de Consulta Post-Ejecución

---

## 1. Resultados de la Simulación en Producción

La suite [`e2e/production_live_validation.spec.ts`](file:///home/merolhack/fl/cadensa-web/e2e/production_live_validation.spec.ts) ejecutó una sesión completa simulando un paciente real en el sitio público:

1. **Rendimiento y Carga en Edge**:
   - Despliegue estático SPA en Cloudflare Pages con respuesta HTTP 200 en todos los assets HTML, JS y CSS en menos de 400 ms.
2. **Google Analytics 4**:
   - Inyección y ejecución confirmada del script `https://www.googletagmanager.com/gtag/js?id=G-HCTT9146TJ`.
   - Captura de eventos `page_view` y despacho de eventos `exception`.
3. **Flujo de Acceso Google OAuth 2.0**:
   - Apertura del modal interactivo y presencia operativa del botón de autenticación federada con Google.
4. **Patrón Blind-Drop en Supabase PostgREST**:
   - **Hallazgo Crítico**: En tablas protegidas por RLS donde los usuarios anónimos tienen permiso de `INSERT` pero no de `SELECT` (`client_telemetry_errors`), una cabecera `Prefer: return=representation` fuerza a PostgREST a ejecutar `RETURNING *`. Esto provoca un fallo RLS (`code: 42501`) al intentar evaluar la política de lectura ausente.
   - **Solución Implementada**: El cliente utiliza la inserción estándar sin `.select()` o con la cabecera `Prefer: return=minimal`, lo cual responde exitosamente con `HTTP 201 Created` sin violar la política de privacidad.

---

## 2. Evidencia de Datos Persistidos en Supabase

Consulta directa ejecutada contra `public.client_telemetry_errors` en el proyecto `kddeejyhnxrnmkmiwjxp`:
- Registro: `id: d4b775f6-bc02-4383-af22-db501f7b037e`
- Evento: `e2e_live_validation`
- Mensaje: `Prueba E2E de Verificación en Producción (Usuario Simulado)`
- Componente: `E2EProductionValidator`
- URL: `https://cadensa-web.pages.dev/`
- Timestamp: `2026-10-30 02:57:42.525331+00`
