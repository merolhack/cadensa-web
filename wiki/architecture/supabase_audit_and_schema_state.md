---
title: "Auditoría de Estado de Supabase: Diagnóstico de Tablas, Pruebas y Migraciones"
category: "architecture"
tags: [supabase, database, audit, postgresql, migrations, rls]
last_updated: "2026-10-24"
sources:
  - "src/lib/supabaseClient.ts"
  - "src/lib/trainingService.ts"
  - "scripts/migrate_supabase.cjs"
  - "supabase/migrations/20260531140826_init_schema.sql"
  - "supabase/migrations/20261023140000_training_and_streaks.sql"
related:
  - "wiki/architecture/backend_database.md"
  - "wiki/architecture/auth_and_data_budget.md"
  - "wiki/concepts/zero_trust_rls.md"
---

# Auditoría Técnica de Supabase en Cadensa

Este documento detalla el diagnóstico y la automatización integral de **Supabase** en el proyecto Cadensa (Proyecto: `kddeejyhnxrnmkmiwjxp`), documentando la ejecución desatendida de migraciones SQL, la verificación en tiempo real de las tablas de PostgreSQL y el aislamiento estricto de las pruebas automatizadas.

---

## 1. Resumen Ejecutivo del Estado Remoto

| Componente | Estado Remoto en Supabase | Detalle / Verificación PostgREST |
| :--- | :---: | :--- |
| **Servicio de Autenticación (GoTrue)** | ✅ **Activo / Saludable** | Endpoint de Auth y `getSession` responden con código 200 sin errores. |
| **Tabla `public.profiles`** | ✅ **Migrada y Activa** | HTTP 200 OK — Políticas RLS y trigger `on_auth_user_created` activos. |
| **Tabla `public.exercises`** | ✅ **Migrada y Activa** | HTTP 200 OK — Catálogo clínico inicial insertado en PostgreSQL. |
| **Tabla `public.training_sessions`** | ✅ **Migrada y Activa** | HTTP 200 OK — Aislamiento Zero-Trust por `auth.uid() = user_id`. |
| **Tabla `public.user_streaks`** | ✅ **Migrada y Activa** | HTTP 200 OK — Gamificación (rachas, XP, minutos) lista para sincronización. |
| **Datos de Pruebas Unitarias y BDD** | 🛡️ **Aislados Localmente** | 114 pruebas unitarias y 59 escenarios BDD corren con mocks (Zero-Pollution). |
| **Automatización CI/CD** | 🤖 **100% Desatendida** | Migraciones integradas en GitHub Actions y ejecutables con `npm run db:migrate`. |

---

## 2. Automatización Desatendida de Migraciones

Para eliminar la intervención manual mediante copiado y pegado en dashboards web, se implementó un flujo directo a través de la **Supabase Management REST API**:

### Pipeline de Ejecución (`scripts/migrate_supabase.cjs`)
1. Carga de credenciales desde `.env` (`SUPABASE_ACCESS_TOKEN` tipo `sbp_...`).
2. Lectura secuencial de las migraciones SQL en `supabase/migrations/`.
3. Envío directo al endpoint administrativo de Supabase:
   `POST https://api.supabase.com/v1/projects/kddeejyhnxrnmkmiwjxp/database/query`
4. Sondeo inmediato a través de PostgREST con la clave anon para certificar que el schema cache de PostgreSQL registre las tablas con HTTP 200.

### Resultado de la Ejecución en Vivo:
```text
=======================================================
🚀 Iniciando Ejecución Desatendida de Migraciones SQL
📌 Proyecto Supabase: kddeejyhnxrnmkmiwjxp
📂 Migraciones detectadas: 2
=======================================================

⏳ [1/2] Enviando migración: 20260531140826_init_schema.sql...
✅ [2/2] Migración 20260531140826_init_schema.sql ejecutada exitosamente.

⏳ [1/2] Enviando migración: 20261023140000_training_and_streaks.sql...
✅ [2/2] Migración 20261023140000_training_and_streaks.sql ejecutada exitosamente.

-------------------------------------------------------
🔍 Validando estado de tablas en PostgreSQL vía PostgREST...
-------------------------------------------------------
✅ Tabla public.profiles: ACTIVA (HTTP 200) - Registros devueltos: 0
✅ Tabla public.exercises: ACTIVA (HTTP 200) - Registros devueltos: 2
✅ Tabla public.training_sessions: ACTIVA (HTTP 200) - Registros devueltos: 0
✅ Tabla public.user_streaks: ACTIVA (HTTP 200) - Registros devueltos: 0

🎉 ¡Todas las tablas fueron creadas y verificadas exitosamente en Supabase!
```

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
   - Cuando un paciente entrena en la aplicación web sin haber iniciado sesión o en modo sin conexión, [`trainingService.ts`](file:///Ubuntu-20.04/home/merolhack/fl/cadensa-web/src/lib/trainingService.ts) mantiene los registros en `localStorage` (`cadensa_streak_days`, `cadensa_total_minutes`, `cadensa_xp_points`, `cadensa_user_email`).
   - Al iniciar sesión mediante Google OAuth o Magic Link, el cliente sincroniza de forma transparente los datos locales hacia las tablas `training_sessions` y `user_streaks`.

---

## 4. Integración en el Flujo de Trabajo (Comandos y CI/CD)

- **Ejecución Local Desatendida:**
  ```bash
  npm run db:migrate
  ```
- **Integración en GitHub Actions (`.github/workflows/deploy.yml`):**
  El pipeline de despliegue continuo cuenta con el paso condicional:
  ```yaml
  - name: Apply Supabase Migrations
    if: github.ref == 'refs/heads/main' && secrets.SUPABASE_ACCESS_TOKEN != ''
    run: npm run db:migrate
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  ```
  El secreto `SUPABASE_ACCESS_TOKEN` ya se encuentra aprovisionado en el almacén seguro de GitHub Secrets, asegurando que cualquier migración SQL futura que se añada a `supabase/migrations/` se aplique automáticamente en producción con cada push a la rama `main`.
