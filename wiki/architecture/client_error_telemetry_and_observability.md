# Arquitectura de Observabilidad de Cliente y Telemetría de Errores — Cadensa

> **Documento Canónico de Diseño de Sistemas y Diagnóstico Forense en Frontend**  
> Última actualización: 2026-10-29  
> Contexto: Telemetría de errores en runtime, excepciones de autenticación y clics rotos bajo arquitectura híbrida GA4 + Supabase Zero Trust RLS.

---

## 1. El Desafío de la Observabilidad en Aplicaciones Foniátricas SPA

En aplicaciones clínicas orientadas a trastornos del habla (como la disfemia), un error no controlado en un botón crítico (como *"Continuar con Google"*, *"Guardar Frase"* o el encendido del metrónomo) desata frustración inmediata y abandono del tratamiento.

### Limitaciones de los Métodos Convencionales
1. **Puntos Ciegos de Google Analytics 4 (GA4):**
   - GA4 trunca stack traces largos (>150 caracteres).
   - Demora entre 24 y 48 horas en consolidar reportes fuera de la vista de tiempo real.
   - Bloqueadores de anuncios y rastreo (uBlock Origin, Brave Shield, Firefox ETP) bloquean los dominios de Google Analytics en un 25% a 40% de los usuarios.
2. **Crashes Silenciosos:**
   - La mayoría de las fallas en APIs asíncronas no arrojan una pantalla blanca ("crash"), sino excepciones controladas en bloques `try/catch` que muestran avisos en pantalla pero no alertan al equipo técnico.

---

## 2. Arquitectura Híbrida: Google Analytics 4 + Supabase Zero Trust RLS

Para resolver los puntos ciegos, Cadensa implementa un **despachador dual**:

```text
[Excepción de JS / Falla de Botón / Error OAuth]
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
      [Canal GA4]           [Canal Supabase RLS]
   (gtag 'exception')   (client_telemetry_errors)
            │                       │
            ▼                       ▼
   [Métricas Agregadas]     [Diagnóstico Forense Inmediato]
   - % Tasa de error/día     - Stack trace completo sin truncar
   - Dispositivos y SO       - Parámetros de petición y URL
   - Embudo de conversión    - Inmune a bloqueadores de anuncios
```

---

## 3. Estructura de Datos en Supabase (`client_telemetry_errors`)

Migración: `supabase/migrations/20261029210000_client_telemetry_errors.sql`:

```sql
CREATE TABLE public.client_telemetry_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL DEFAULT 'javascript_error',
  error_message text NOT NULL,
  stack_trace text,
  component text,
  url text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Modelo de Seguridad Zero Trust RLS
- **Inserción Abierta Controlada:** Cualquier visitante (anónimo o autenticado) puede enviar reportes de telemetría sin permisos elevados (`for insert with check (true)`).
- **Lectura Blind-Drop:** Los errores son confidenciales; únicamente los administradores verificados mediante `public.is_admin()` pueden consultar y auditar la tabla.

---

## 4. Despachador en Cliente (`src/lib/errorTracker.ts`)

Provee dos funciones clave:
1. `reportAppError(payload)`:
   - Despacha a `window.gtag('event', 'exception', ...)` o `window.dataLayer`.
   - Inserta la fila en `client_telemetry_errors` en Supabase.
   - Cuenta con **deduplicación en memoria (10 segundos)** para impedir saturación de red si un bucle de renderizado entra en fallo recurrente.
   - Garantiza **Silent Fail**: Una falla en el envío de telemetría jamás interrumpe la ejecución ni la práctica del paciente.
2. `initGlobalErrorTracking()`:
   - Escuchadores automáticos en `window.addEventListener('error')` (excepciones de sintaxis y runtime).
   - Escuchadores en `window.addEventListener('unhandledrejection')` (promesas rechazadas en red o Web Audio).

---

## 5. Visualización en la Consola Administrativa (`/admin`)

En la pestaña **🛡️ Observabilidad & Errores JS**, el equipo administrativo puede auditar los últimos 50 incidentes reportados en vivo con timestamp en hora local, componente de origen, stack trace expandible e identificador de usuario si estaba autenticado.

