# Bitácora Cronológica del LLM Wiki — Cadensa

> **Registro Append-Only de Ingestas, Consultas y Auditorías (Lint)**  
> Formato de cabecera estándar: `## [YYYY-MM-DD] <operación> | <resumen>`  
> Parseable con terminal: `grep "^## \[" wiki/log.md | tail -5`

---

## [2026-10-23] ingest | Creación e inicialización del LLM Wiki de Cadensa
- **Detalle**: Análisis exhaustivo del repositorio Cadensa PoC e inicialización de la arquitectura de LLM Wiki modular siguiendo el estándar de Andrej Karpathy (3 capas: Fuentes crudas, Wiki persistente y Esquema de gobierno).
- **Archivos creados**:
  - `wiki/SCHEMA.md`: Especificación del sistema, reglas de frontmatter y operaciones Ingest/Query/Lint.
  - `wiki/index.md`: Catálogo global y mapa de navegación para LLMs y humanos.
  - `wiki/log.md`: Bitácora cronológica append-only.
  - `wiki/raw/clinical_foundations.md`: Fuente cruda con el marco clínico del habla rítmica silábica.
  - `wiki/raw/poc_specifications.md`: Fuente cruda con los requerimientos técnicos del PoC.
  - `wiki/architecture/overview.md`: Visión general de la arquitectura Jamstack desacoplada.
  - `wiki/architecture/frontend.md`: Arquitectura Next.js 16, React 19, Tailwind v4 y Static Export.
  - `wiki/architecture/backend_database.md`: Arquitectura Supabase PostgreSQL, funciones PL/pgSQL y RLS.
  - `wiki/architecture/cicd_deployment.md`: Pipeline GitHub Actions y despliegue a Cloudflare Pages.
  - `wiki/concepts/syllable_timed_speech.md`: Concepto clínico, base neurobiológica y metodología.
  - `wiki/concepts/zero_trust_rls.md`: Seguridad delegada al motor de base de datos con anon key.
  - `wiki/concepts/static_spa_paradigm.md`: Justificación y restricciones de `output: 'export'`.
  - `wiki/entities/supabase.md`: Cliente singleton tipado y CLI de Supabase.
  - `wiki/entities/cloudflare_pages.md`: Infraestructura de hosting perimetral Anycast.
  - `wiki/entities/profiles_table.md`: DDL, triggers y políticas de `public.profiles`.
  - `wiki/roadmap/product_evolution.md`: Hoja de ruta para evolución de PoC hacia MVP funcional.
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] lint | Primera auditoría de salud del wiki
- **Estado**: Aprobado.
- **Métricas**:
  - Total de páginas: 15 archivos.
  - Páginas huérfanas: 0 (todos los documentos están enlazados desde `wiki/index.md` y referenciados entre sí).
  - Contradicciones detectadas: 0 (las versiones de dependencias y configuraciones de `output: 'export'` coinciden con `package.json`, `next.config.ts` y `.github/workflows/deploy.yml`).
  - Cobertura de entidades: Completa para el estado actual del PoC.

---

## [2026-10-23] ingest | Actualización de dependencias estables, Dockerfile y suite de pruebas
- **Detalle**:
  1. Actualización de dependencias a versiones estables (Next.js 16.4.3, React 19.3.1, @supabase/supabase-js 2.109.0), resolviendo todas las alertas de seguridad (0 vulnerabilidades).
  2. Implementación de Dockerfile multi-stage (`node:20-slim` para compilación Turbopack con glibc + `nginx:alpine` para runtime final ultraligero con SPA fallback), `.dockerignore`, `nginx.conf` y `docker-compose.yml`.
  3. Creación de suite completa de pruebas:
     - Pruebas unitarias con Vitest 4 y React Testing Library (`src/lib/rhythm.test.ts`, `src/app/page.test.tsx`).
     - Pruebas BDD con Cucumber y Gherkin en español (`features/rhythm_pacing.feature`, `features/onboarding_navigation.feature`).
- **Archivos creados/modificados**:
  - `package.json`, `package-lock.json`
  - `Dockerfile`, `.dockerignore`, `nginx.conf`, `docker-compose.yml`
  - `vitest.config.mts`, `vitest.setup.ts`, `cucumber.json`
  - `src/lib/rhythm.ts`, `src/lib/rhythm.test.ts`, `src/app/page.test.tsx`
  - `features/rhythm_pacing.feature`, `features/onboarding_navigation.feature`
  - `features/step_definitions/rhythm_steps.ts`, `features/step_definitions/onboarding_steps.ts`
  - `wiki/architecture/containerization.md`, `wiki/architecture/testing.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Plan Maestro de Actividades y Directrices Mandatorias para Agentes
- **Detalle**:
  1. Definición y formalización del plan maestro de actividades en 6 fases (`wiki/roadmap/activity_plan.md`) para cumplir el objetivo clínico y de producto de Cadensa.
  2. Actualización de `AGENTS.md`, `README.md` y `wiki/SCHEMA.md` estableciendo el uso obligatorio de:
     - `codebase-memory` (`home-merolhack-fl-cadensa-web: /home/merolhack/fl/cadensa-web`).
     - `ollama-local` (`gemma4:cloud` -> `qwen3:8b-8k`).
     - LLM Wiki modular estructurado en 3 capas.
     - Cobertura obligatoria de pruebas unitarias (Vitest) y BDD (Cucumber/Gherkin).
  3. Reindexación completa del grafo del repositorio en `codebase-memory`.
- **Archivos creados/modificados**:
  - `AGENTS.md`, `README.md`
  - `wiki/SCHEMA.md`, `wiki/index.md`, `wiki/log.md`
  - `wiki/roadmap/activity_plan.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Implementación interactiva de Metrónomo Web Audio y Lector Silábico (Fase 1 y 2)
- **Detalle**:
  1. Implementación del motor de audio de precisión `AudioMetronome` (`src/lib/audioMetronome.ts`) con lookahead scheduler de jitter cero.
  2. Creación de componentes UI reactivos: `MetronomeVisual` (orbe pulsante y compases) y `SyllableReader` (segmentación y resaltado de sílaba activa en tiempo real).
  3. Transformación de la vista principal (`src/app/page.tsx`) en un prototipo interactivo de entrenamiento con controles de BPM (60 a 160 BPM), preajustes clínicos y rotación de frases.
  4. Cobertura completa de pruebas:
     - 39 pruebas unitarias en Vitest (`src/**/*.test.{ts,tsx}`).
     - 23 escenarios BDD en Cucumber.js (`features/*.feature` con 84 pasos).
  5. Despliegue en contenedor Docker y validación visual con captura en vivo.
- **Archivos creados/modificados**:
  - `src/lib/audioMetronome.ts`, `src/lib/audioMetronome.test.ts`
  - `src/components/MetronomeVisual.tsx`, `src/components/MetronomeVisual.test.tsx`
  - `src/components/SyllableReader.tsx`, `src/components/SyllableReader.test.tsx`
  - `src/app/page.tsx`, `features/metronome_playback.feature`, `features/step_definitions/metronome_steps.ts`
  - `wiki/architecture/audio_engine.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Finalización integral de Fases 3, 4, 5 y 6 (Supabase, Detección de Voz, Gamificación y PWA)
- **Detalle**:
  1. **Fase 3 (Persistencia y Catálogo)**: Migración SQL `20261023140000_training_and_streaks.sql` con tablas `exercises`, `training_sessions` y `user_streaks`. Servicio `trainingService.ts` con fallback offline instantáneo y modal de autenticación accesible `AuthModal.tsx`.
  2. **Fase 4 (Captura de Voz y Precisión Rítmica)**: Algoritmo `voiceDetection.ts` con cálculo de offset temporal frente al beat, clasificación clínica (Excelente ≤ 45ms, Bueno ≤ 90ms, Desfasado > 90ms) y cálculo de racha rítmica.
  3. **Fase 5 (Gamificación y Métricas)**: Módulo `streaks.ts` con cálculo de XP por sesión y desbloqueo de insignias clínicas (Primer Ritmo, Sembrador de Hábitos, Maestro de la Cadencia). Componente `Dashboard.tsx` interactivo con métricas de progreso.
  4. **Fase 6 (PWA Offline y Optimización CX/UX)**: Manifiesto web `manifest.json`, Service Worker `sw.js` para caché de shell y assets, integración completa de estados y feedback visual en `src/app/page.tsx`.
  5. **Validación Integral**: 59 pruebas unitarias Vitest y 36 escenarios BDD Cucumber pasando al 100%. Cero advertencias de linting y compilación estática Next.js limpia.
- **Archivos creados/modificados**:
  - `src/lib/trainingService.ts`, `src/lib/trainingService.test.ts`
  - `src/lib/voiceDetection.ts`, `src/lib/voiceDetection.test.ts`
  - `src/lib/streaks.ts`, `src/lib/streaks.test.ts`
  - `src/components/Dashboard.tsx`, `src/components/Dashboard.test.tsx`
  - `src/components/AuthModal.tsx`, `src/components/AuthModal.test.tsx`
  - `public/manifest.json`, `public/sw.js`, `src/app/layout.tsx`
  - `features/session_persistence.feature`, `features/voice_accuracy.feature`, `features/gamification_badges.feature`
  - `features/step_definitions/session_steps.ts`, `features/step_definitions/voice_steps.ts`, `features/step_definitions/gamification_steps.ts`
- **Autor**: LLM Pair Programmer (Antigravity).

