---
title: "Auditoría de Estado de Supabase: Diagnóstico de Tablas, Pruebas y Migraciones"
category: "architecture"
tags: [supabase, database, audit, postgresql, migrations, rls]
last_updated: "2026-10-24"
sources:
  - "src/lib/supabaseClient.ts"
  - "src/lib/trainingService.ts"
  - "supabase/migrations/20260531140826_init_schema.sql"
  - "supabase/migrations/20261023140000_training_and_streaks.sql"
related:
  - "wiki/architecture/backend_database.md"
  - "wiki/architecture/auth_and_data_budget.md"
  - "wiki/concepts/zero_trust_rls.md"
---

# Auditoría Técnica de Supabase en Cadensa

Este documento detalla el diagnóstico exhaustivo realizado sobre el entorno de **Supabase** del proyecto Cadensa (Proyecto: `kddeejyhnxrnmkmiwjxp`), analizando qué información reside actualmente en la base de datos remota, cómo se gestionan los datos de las pruebas automatizadas y el estado de ejecución de las migraciones SQL.

---

## 1. Resumen Ejecutivo del Diagnóstico

| Componente | Estado Remoto en Supabase | Detalle / Causa Raíz |
| :--- | :---: | :--- |
| **Servicio de Autenticación (GoTrue)** | ✅ **Activo / Saludable** | Endpoint de Auth y `getSession` responden con código 200 sin errores. |
| **Tabla `public.profiles`** | ⚠️ **Pendiente de Migración** | HTTP 404 (`Could not find the table 'public.profiles' in the schema cache`). |
| **Tabla `public.exercises`** | ⚠️ **Pendiente de Migración** | HTTP 404 (`Could not find the table 'public.exercises' in the schema cache`). |
| **Tabla `public.training_sessions`** | ⚠️ **Pendiente de Migración** | HTTP 404 (`Could not find the table 'public.training_sessions' in the schema cache`). |
| **Tabla `public.user_streaks`** | ⚠️ **Pendiente de Migración** | HTTP 404 (`Could not find the table 'public.user_streaks' in the schema cache`). |
| **Datos de Pruebas Unitarias y BDD** | 🛡️ **Aislados Localmente** | Las 114 pruebas unitarias y 59 escenarios BDD se ejecutan contra mocks y memoria local. |
| **Experiencia de Usuario en la Web** | ✅ **Operativa (Offline-First)** | El cliente web conmuta automáticamente al catálogo de respaldo y almacenamiento local. |

---

## 2. Diagnóstico de la Base de Datos Remota

Al inspeccionar directamente la instancia remota de Supabase con las credenciales configuradas en `.env` (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`), se obtuvieron las siguientes respuestas de la API PostgREST:

```text
Supabase URL: https://kddeejyhnxrnmkmiwjxp.supabase.co
Supabase Key: [Configurada y verificada]

1. public.exercises: 404 Not Found (Could not find table in schema cache)
2. public.profiles: 404 Not Found (Could not find table in schema cache)
3. public.training_sessions: 404 Not Found (Could not find table in schema cache)
4. public.user_streaks: 404 Not Found (Could not find table in schema cache)
5. Auth Health: getSession = OK (true)
```

### ¿Por qué ocurre esto?
Las migraciones SQL existen como código fuente versionado en el repositorio (`supabase/migrations/`), pero **aún no se han corrido en la base de datos PostgreSQL de producción de Supabase**. 

Como la clave provista en el cliente web es la `anon` (clave pública con permisos de cliente y sujeta a Row Level Security), esta no cuenta con privilegios DDL (`CREATE TABLE`) para autogenerar las tablas en tiempo de ejecución. La creación de tablas debe realizarse a través de la consola de Supabase o mediante la CLI con credenciales administrativas.

---

## 3. ¿Dónde residen los datos de las pruebas?

**En Supabase no existe información de pruebas contaminando la base de datos.** Esto responde al diseño de arquitectura Zero-Pollution de Cadensa:

1. **Pruebas Unitarias (Vitest):**
   - Se ejecutan en un entorno simulado (`jsdom` / Node.js) donde `supabaseClient` está aislado con URLs ficticias en `vitest.setup.ts`.
   - Todas las llamadas a `trainingService` se prueban mediante espías (`vi.spyOn`) y fixtures locales.
2. **Pruebas BDD (Cucumber.js):**
   - Validan la lógica fonoaudiológica, las fórmulas de isocronía y el renderizado estático de componentes (`renderToString`).
   - No realizan mutaciones de red en Supabase.
3. **Persistencia Local de Usuario (Fallback Offline-First):**
   - Cuando un paciente entrena en la aplicación web sin haber iniciado sesión o cuando las tablas de Supabase no responden, [`trainingService.ts`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/trainingService.ts) activa el modo de resiliencia local:
     - `cadensa_streak_days`: Días continuos de entrenamiento.
     - `cadensa_total_minutes`: Tiempo diario acumulado.
     - `cadensa_xp_points`: Puntos de experiencia ganados.
     - `cadensa_user_email`: Identificador de sesión.

---

## 4. Guía para Aplicar las Migraciones en Supabase

Para que las tablas queden plenamente creadas en PostgreSQL y comiencen a recibir las sesiones de los usuarios autenticados, se deben aplicar las dos migraciones existentes:

### Opción A: Desde el Editor SQL de Supabase Dashboard (Recomendada)
1. Iniciar sesión en [Supabase Dashboard](https://supabase.com/dashboard/project/kddeejyhnxrnmkmiwjxp).
2. Entrar a la sección **SQL Editor** (`/sql/new`).
3. Pegar y ejecutar secuencialmente los scripts:
   - **Script 1:** [`supabase/migrations/20260531140826_init_schema.sql`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/supabase/migrations/20260531140826_init_schema.sql)
     - Crea `public.profiles`.
     - Habilita RLS (lectura pública, edición exclusiva del propietario).
     - Instala trigger automático `on_auth_user_created` para vincular perfiles en el registro.
   - **Script 2:** [`supabase/migrations/20261023140000_training_and_streaks.sql`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/supabase/migrations/20261023140000_training_and_streaks.sql)
     - Crea `public.exercises`, `public.training_sessions` y `public.user_streaks`.
     - Configura políticas Zero-Trust RLS (aislamiento estricto por `auth.uid() = user_id`).
     - Inserta los ejercicios clínicos de semilla inicial.

### Opción B: Mediante Supabase CLI
```bash
# Vincular el proyecto con la CLI de Supabase
npx supabase link --project-ref kddeejyhnxrnmkmiwjxp

# Enviar todas las migraciones locales a la base remota
npx supabase db push
```

Una vez ejecutadas, el cliente de Cadensa sincronizará de forma transparente tanto en la nube como en local.
