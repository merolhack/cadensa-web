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

---

## [2026-10-23] ingest | Diagnóstico de GitHub Actions, Arquitectura OAuth y Presupuesto de Base de Datos
- **Detalle**:
  1. **Diagnóstico y Reparación de CI/CD**:
     - Identificación de causa de fallo en GitHub Actions: acción no existente `cloudflare/pages-action` y ausencia de secretos en el repositorio.
     - Actualización a `cloudflare/wrangler-action@v3` con validación condicional de credenciales y ejecución obligatoria de pruebas continuas (`npm run test:all`).
  2. **Estrategia de Registro y Validación (Soft Confirmation)**:
     - Documentación de política de acceso diferido para evitar abandono en personas que tartamudean.
  3. **Flujo de OAuth**:
     - Soporte para Google OAuth y Magic Link en `AuthModal.tsx` con manejo estático en browser.
  4. **Presupuesto de Datos PostgreSQL**:
     - Cálculo exacto en disco: ~200 bytes por sesión, ~144 KB/año por usuario, proyección de 1.44 GB al año para 10,000 usuarios activos diarios.
  5. **Cobertura de Pruebas**:
     - Actualización de pruebas unitarias (`AuthModal.test.tsx`) y nuevo feature BDD (`features/user_registration_oauth.feature`).
- **Archivos creados/modificados**:
  - `.github/workflows/deploy.yml`
  - `src/components/AuthModal.tsx`, `src/components/AuthModal.test.tsx`
  - `features/user_registration_oauth.feature`, `features/step_definitions/auth_oauth_steps.ts`
  - `wiki/architecture/auth_and_data_budget.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Aprovisionamiento de Credenciales Cloudflare, Supabase y Configuración de GitHub Secrets
- **Detalle**:
  1. **Generación de Credenciales de Cloudflare**:
     - Obtención de `CLOUDFLARE_ACCOUNT_ID` (`7ed54d7f608c3bd306ccb4c447546d8f`) y generación de `CLOUDFLARE_API_TOKEN` con permisos de edición para Cloudflare Pages y Workers.
  2. **Obtención de Credenciales de Supabase**:
     - Conexión con la organización `ymqoilvikpjihsrtcbdf` y proyecto `kddeejyhnxrnmkmiwjxp`.
     - Obtención de `NEXT_PUBLIC_SUPABASE_URL` y API key anon/publishable (`sb_publishable_mMAujK8tzTnjF6FSrL-lAA_1U5nXZ1_`), verificada exitosamente con el endpoint de GoTrue Auth.
  3. **Seguridad y Control de Versiones**:
     - Configuración estricta en `.gitignore` para bloquear `.env`, permitiendo únicamente plantillas `.env.example`.
     - Creación de `.env` local con credenciales reales y `.env.example` de referencia.
  4. **Aprovisionamiento Automatizado en GitHub**:
     - Inyección de los 4 secretos en `https://github.com/merolhack/cadensa-web/settings/secrets/actions` (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  5. **Verificación Local Completa**:
     - Ejecución exitosa de 68 pruebas unitarias (Vitest), 40 escenarios BDD (Cucumber) y compilación estática Next.js Turbopack (`out/`).
- **Archivos creados/modificados**:
  - `.gitignore`, `.env.example`, `.env` (ignorado en git), `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Optimización Ergonómica de UI: Visibilidad de Botones sobre el Pliegue y Diferenciación de Categorías
- **Detalle**:
  1. **Regla de Gobernanza en AGENTS.md**:
     - Establecimiento de regla mandatoria: auditar activamente los GitHub Actions tras cada push remoto y verificar su estado 100% verde antes de concluir cualquier actividad.
  2. **Resolución de Visibilidad de Botones (Above the Fold)**:
     - Reestructuración del layout: compactación del header, reducción de escala del orbe en `MetronomeVisual.tsx` y reposicionamiento de los botones de acción principal ("Comenzar Práctica Rítmica" y "Audio") directamente bajo el lector silábico.
     - Garantía de visibilidad inmediata sin requerir scroll tanto en vista de escritorio (1280x800) como en móvil (375x667).
  3. **Diferenciación entre 'Todas' y 'Diadococinesia'**:
     - Reordenamiento del catálogo clínico (`clinicalExercises.ts`) para que 'Todas' inicie con Fonética Básica e isocronía ("Ca mi no des pa cio ca da ma ña na", 80 BPM).
     - Al alternar a 'Diadococinesia', la frase cambia inmediatamente a "Pa ta ka pa ta ka pa ta ka" (75 BPM), con su respectivo objetivo clínico y sincronización de BPM.
  4. **Validación Visual y Automatizada**:
     - 68 pruebas unitarias Vitest y 40 escenarios BDD Cucumber pasando.
     - Capturas verificadas en navegador para Desktop y Mobile.
---

## [2026-10-23] ingest | Suite Evolutiva V2: Vinculación AMTTM, Control Respiratorio, Compases y Timbres Sintéticos
- **Detalle**:
  1. **Análisis Integral de Autenticación Supabase**:
     - Verificación activa contra GoTrue endpoint con API Key anon.
     - Confirmación de creación de usuario (`User ID: ca5ca2b3-31a7-46fc-8297-c856b8ef6f57`) con dominios válidos.
     - Identificación de validación de dominios RFC y configuración de "Confirm Email". Justificación de estrategia Cadensa: Soft Confirmation, Guest Mode y Google OAuth.
  2. **Banner Oficial AMTTM**:
     - Componente accesible `CommunityBanner.tsx` con persistencia en localStorage vía `useSyncExternalStore` y enlace seguro hacia `https://www.facebook.com/AMTTM/`.
  3. **Marcapasos de Respiración Diafragmática (Box Breathing 4-4-4-4)**:
     - Componente interactivo `BreathingPacer.tsx` con ciclos de Inhalar, Sostener, Exhalar y Pausa para reducción de ansiedad previa al habla.
  4. **Compases Musicales y Timbres Sintéticos**:
     - Selector de compás (4/4, 3/4, 2/4) en `AudioMetronome.ts` y visualizador dinámico en `MetronomeVisual.tsx`.
     - Presets acústicos sintéticos de latencia cero: Clásico (880/587Hz), Madera/Woodblock (720/480Hz) y Digital Suave (520/360Hz).
  5. **Herramientas de Accesibilidad y Práctica Autónoma**:
     - Desafío de atenuación rítmica (fading: 4 compases con sonido, 2 en silencio mental).
     - Escala de tipografía para lectura silábica (`normal`, `grande`, `extragrande`).
     - Anillo de progreso para meta diaria (objetivo 5 minutos).
     - Creador de frases personalizadas con silabificación automática inmediata.
     - Botón de cierre de sesión y sincronización en tiempo real vía `onAuthStateChange`.
  6. **Validación Automatizada Rigurosa**:
     - 76 pruebas unitarias Vitest y 44 escenarios BDD Cucumber pasando al 100%.
     - 0 errores y 0 advertencias en ESLint; compilación de producción Next.js limpia.
- **Archivos creados/modificados**:
  - `src/components/CommunityBanner.tsx`, `src/components/CommunityBanner.test.tsx`
  - `src/components/BreathingPacer.tsx`, `src/components/BreathingPacer.test.tsx`
  - `src/lib/audioMetronome.ts`, `src/lib/audioMetronome.test.ts`
  - `src/components/MetronomeVisual.tsx`, `src/components/SyllableReader.tsx`
  - `src/app/page.tsx`
  - `features/community_and_breathing.feature`, `features/step_definitions/community_steps.ts`
  - `wiki/roadmap/evolution_v2_plan.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Configuración en Producción de Google OAuth 2.0 y Reubicación Ergonómica de Banner AMTTM
- **Detalle**:
  1. **Aprovisionamiento de Credenciales OAuth 2.0 en Google Cloud Console**:
     - Creación de cliente web OAuth "Cadensa Web Client" en el proyecto `cadensa-web-dev`.
     - Orígenes de JavaScript autorizados: `https://kddeejyhnxrnmkmiwjxp.supabase.co`, `https://cadensa-web.pages.dev`, `http://localhost:3000`.
     - URI de redireccionamiento autorizado: `https://kddeejyhnxrnmkmiwjxp.supabase.co/auth/v1/callback`.
     - Client ID: `1014778372980-ff8dp5c48nss88745u0r70nsn7ovob2a.apps.googleusercontent.com`.
  2. **Activación de Proveedor Google en Supabase Dashboard**:
     - Habilitación del switch "Sign in with Google" e inyección de Client ID y Client Secret en `kddeejyhnxrnmkmiwjxp`.
     - Configuración de URL del Sitio (`https://cadensa-web.pages.dev`) y URLs de redirección permitidas (`https://cadensa-web.pages.dev/**`, `http://localhost:3000/**`).
     - Verificación activa mediante curl: El endpoint `/auth/v1/authorize?provider=google` responde con HTTP 302 hacia `accounts.google.com`.
  3. **Reubicación Ergonómica de UI**:
     - Desplazamiento del banner AMTTM hacia la sección inferior, ubicándolo inmediatamente antes del footer.
     - Garantía de visibilidad limpia en la cabecera para el logo, versión y botón de inicio de sesión.
  4. **Verificación Automatizada**:
     - 76 pruebas unitarias Vitest y 44 escenarios BDD Cucumber pasando al 100%.
- **Archivos creados/modificados**:
  - `src/app/page.tsx`, `features/community_and_breathing.feature`, `features/step_definitions/community_steps.ts`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Publicación de Guía Interactiva FAQ de Botones y Fundamento Clínico STS
- **Detalle**:
  1. **Componente FAQ y Metodología (`FaqAndMethodology.tsx`)**:
     - Implementación de acordeón interactivo ubicado estratégicamente arriba del banner de la AMTTM.
     - Guía detallada y didáctica de cada botón y grupo funcional:
       - Controles principales: Práctica Rítmica, Audio/Mute, Respiración Diafragmática (4-4-4-4) y Guardado de sesión.
       - Evaluación y feedback: Explicación de la medición en milisegundos de "Registrar Sílaba" (±60ms, ±120ms, >120ms), micro-vibración háptica y reto de atenuación rítmica (Fading 4/2).
       - Catálogo y personalización: Categorías fonoaudiológicas (Fonética, Diadococinesia, Vocales, Polisílabos) y función "+ Mi Frase".
       - Parámetros musicales: Rango de BPM, Compases (4/4, 3/4, 2/4), Timbres acústicos sintéticos y escala de texto accesible.
       - Perfil y sincronización: Racha diaria, minutos acumulados y acceso con Google OAuth / modo invitado.
  2. **Fundamento Clínico de Habla Rítmica Silábica (STS)**:
     - Explicación de las bases neurobiológicas: el ritmo isocrónico como marcapasos neural sustitutivo frente al déficit temporal de los ganglios basales.
     - Beneficios en la reducción de la ansiedad anticipatoria, facilitación de inicios suaves (*easy onset*) y neuroplasticidad mediante sesiones diarias de 5 a 10 minutos.
  3. **Cobertura de Pruebas**:
     - 3 nuevas pruebas unitarias en `src/components/FaqAndMethodology.test.tsx` (total 79 pasando).
     - Nuevo archivo de escenarios BDD `features/faq_and_sts_methodology.feature` con 8 pasos en `features/step_definitions/faq_steps.ts` (total 46 escenarios pasando).
- **Archivos creados/modificados**:
  - `src/components/FaqAndMethodology.tsx`, `src/components/FaqAndMethodology.test.tsx`
  - `src/app/page.tsx`, `src/app/page.test.tsx`
  - `features/faq_and_sts_methodology.feature`, `features/step_definitions/faq_steps.ts`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-23] ingest | Implementación del Menú Modular de Técnicas Clínicas y Modalidad Easy Onset
- **Detalle**:
  1. **Catálogo Unificado de Metodologías Fonoaudiológicas (`clinicalTechniques.ts`)**:
     - Estructuración de 3 familias terapéuticas: Modelado de Fluidez, Control Fisiológico y Modificación del Bloqueo (Van Riper).
     - 7 técnicas clínicas integradas: Habla Rítmica Silábica (STS), Inicio Vocal Suave (Easy Onset), Contacto Articular Suave (Light Contact), Habla Prolongada, Respiración 4-4-4-4, Salida del Bloqueo (Pull-Out) y Cancelación.
     - Cada técnica contiene su definición, objetivo clínico, bases neurobiológicas, pasos prácticos y banco de preguntas frecuentes (FAQ) especializadas.
  2. **Componentes Interactivos**:
     - `TechniqueSelector.tsx`: Botón disparador con técnica activa en navbar y modal accesible para selección de metodología.
     - `TechniqueVisualizer.tsx`: Visualizador adaptativo para Inicio Vocal Suave con rampa dinámica de fonación gradual (0% a 100%), indicador de tacto pluma para Contacto Ligero, estiramiento vocálico para Habla Prolongada y temporizador de 3 segundos para técnicas de Van Riper.
     - `FaqAndMethodology.tsx`: Acordeón multi-pestaña para consultar tanto los botones generales como el FAQ exclusivo de cada técnica.
  3. **Cobertura de Pruebas**:
     - 91 pruebas unitarias pasando al 100% en Vitest (suites en `TechniqueSelector.test.tsx`, `TechniqueVisualizer.test.tsx`, `clinicalTechniques.test.ts`, `FaqAndMethodology.test.tsx`).
     - 49 escenarios BDD en Cucumber.js pasando al 100% (189 pasos).
     - 0 errores y 0 advertencias en ESLint; compilación de producción Next.js limpia.
- **Archivos creados/modificados**:
  - `src/lib/clinicalTechniques.ts`, `src/lib/clinicalTechniques.test.ts`
  - `src/components/TechniqueSelector.tsx`, `src/components/TechniqueSelector.test.tsx`
  - `src/components/TechniqueVisualizer.tsx`, `src/components/TechniqueVisualizer.test.tsx`
  - `src/components/FaqAndMethodology.tsx`, `src/components/FaqAndMethodology.test.tsx`
  - `src/app/page.tsx`
  - `features/modular_clinical_techniques.feature`, `features/step_definitions/technique_steps.ts`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Creación del Compendio Clínico y Documentación Exhaustiva de las 7 Técnicas de Fluidez
- **Detalle**:
  1. **Generación de Documentación Modular en `wiki/concepts/`**:
     - `clinical_techniques_overview.md`: Visión holística, taxonomía en 3 familias fonoaudiológicas (Fluency Shaping, Stuttering Modification de Van Riper, Regulación Autónoma), matriz comparativa y sinergia terapéutica.
     - `easy_onset.md`: Protocolo anatómico de Inicio Vocal Suave, desarticulación del espasmo aductor y ataque glótico en 3 pasos fisiológicos (Suspiro silencioso, Subida gradual, Fonación plena).
     - `light_articulatory_contact.md`: Despresurización de consonantes oclusivas (/p, t, k, b, d, g/), prevención del taponamiento mecánico y regla del Tacto de Pluma (≤30% de presión).
     - `prolonged_speech.md`: Habla Prolongada y legato vocal continuo, eliminación de cortes glóticos (*voicing breaks*) y estiramiento vocálico 2×.
     - `box_breathing.md`: Respiración Cuadrada 4-4-4-4, estimulación del nervio vago, desaceleración del tono simpático y erradicación del habla con volumen residual vacío.
     - `pull_out_technique.md`: Desactivación en tiempo real del bloqueo (Van Riper), etapas clínicas de Congelar (sin empujar) → Aflojar (reducir fuerza) → Deslizar suavemente.
     - `cancellation_technique.md`: Protocolo de Cancelación post-bloqueo, pausa consciente obligatoria de 3 segundos, desarticulación del reflejo de escape y reintento con inicio suave.
  2. **Actualización del Catálogo Maestro (`wiki/index.md`)**:
     - Indexación completa de los 8 nuevos documentos conceptuales.
- **Archivos creados/modificados**:
  - `wiki/concepts/clinical_techniques_overview.md`
  - `wiki/concepts/easy_onset.md`
  - `wiki/concepts/light_articulatory_contact.md`
  - `wiki/concepts/prolonged_speech.md`
  - `wiki/concepts/box_breathing.md`
  - `wiki/concepts/pull_out_technique.md`
  - `wiki/concepts/cancellation_technique.md`
  - `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Implementación de Página de Inicio con Catálogo de Técnicas, Navegación Bidireccional y Modal de Video
- **Detalle**:
  1. **Página de Inicio y Catálogo de Técnicas (`TechniquesCatalogHome.tsx`)**:
     - Vista Landing completa con presentación de Cadensa como Gimnasio Digital de Fluidez del Habla.
     - Métricas diarias de racha, minutos y puntos XP integradas en el header.
     - Filtros por familia terapéutica: *Todas (7)*, *Fluency Shaping (4)*, *Control Fisiológico (1)*, *Modificación Van Riper (2)*.
     - Tarjetas fonoaudiológicas individuales con ícono, nivel de dificultad, objetivo clínico, insignia terapéutica y botones de acción rápida ("Ver Video" y "Entrenar →").
     - Sección metodológica y banner de la AMTTM integrados armoniosamente.
  2. **Modal Interactivo de Video Explicativo (`TechniqueVideoModal.tsx`)**:
     - Componente accesible (tecla Escape, foco, roles de diálogo) para reproducir guías en video (`videoUrl`) o renderizar una tarjeta interactiva con tips y protocolo fisiológico en 3 pasos cuando el video está en producción.
     - Botón de acción directa "Comenzar Práctica de [Técnica]" desde el modal hacia la estación de entrenamiento.
  3. **Navegación Bidireccional en la Estación de Práctica (`page.tsx`)**:
     - Botón "← Inicio" en la barra superior para volver al catálogo en cualquier momento sin perder estado.
     - Botón "🎥 Video" en la barra de navegación para consultar la guía técnica audiovisual directamente desde la estación de entrenamiento.
     - Soporte para vista inicial parametrizada (`initialView="home" | "practice"`) y query param `?view=practice`.
  4. **Cobertura de Pruebas Unitarias y BDD**:
     - Nuevas suites de pruebas unitarias (`TechniquesCatalogHome.test.tsx`, `TechniqueVideoModal.test.tsx`, `page.test.tsx` actualizado) con 113/113 pruebas pasando.
     - Nueva característica BDD (`features/catalog_home_navigation.feature`, `features/step_definitions/catalog_home_steps.ts`) con 59/59 escenarios pasando al 100%.
     - Verificación limpia de linter (`npm run lint`) y compilación estática Next.js (`npm run build`).
- **Archivos creados/modificados**:
  - `src/lib/clinicalTechniques.ts`
  - `src/components/TechniquesCatalogHome.tsx`, `src/components/TechniquesCatalogHome.test.tsx`
  - `src/components/TechniqueVideoModal.tsx`, `src/components/TechniqueVideoModal.test.tsx`
  - `src/app/page.tsx`, `src/app/page.test.tsx`
  - `features/catalog_home_navigation.feature`, `features/step_definitions/catalog_home_steps.ts`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Integración de Enlace Oficial de YouTube en el Banner Comunitario de la AMTTM
- **Detalle**:
  1. **Unificación en el Mismo Banner (`CommunityBanner.tsx`)**:
     - Se evaluó la arquitectura de UI/UX y se determinó que consolidar ambos canales en el mismo banner evita la saturación vertical y mantiene la cohesión de la entidad.
     - Botón de Facebook con isotipo SVG oficial de Facebook (`https://www.facebook.com/AMTTM/`).
     - Botón de YouTube con isotipo SVG oficial de YouTube (`https://www.youtube.com/@amtartamudez`).
     - Etiquetas de accesibilidad `aria-label`, atributos de seguridad `rel="noopener noreferrer"` y apertura en nueva pestaña (`target="_blank"`).
     - Diseño responsivo adaptado para envolver elegantemente en pantallas móviles y de escritorio.
  2. **Actualización de Pruebas Unitarias y BDD**:
     - `CommunityBanner.test.tsx` actualizado con pruebas dedicadas para ambos canales oficiales (Facebook y YouTube).
     - `community_and_breathing.feature` y `community_steps.ts` ampliados con la verificación del canal oficial de YouTube.
     - 114 pruebas unitarias y 59 escenarios BDD validados con 100% de éxito.
- **Archivos creados/modificados**:
  - `src/components/CommunityBanner.tsx`
  - `src/components/CommunityBanner.test.tsx`
  - `features/community_and_breathing.feature`
  - `features/step_definitions/community_steps.ts`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Visibilidad Permanente y Alineación Horizontal de Botones en el Banner Oficial AMTTM
- **Detalle**:
  1. **Visibilidad Permanente del Banner (`CommunityBanner.tsx`)**:
     - Se eliminó el botón de descarte (`✕`) y el estado condicional de ocultamiento, asegurando que el banner institucional de la AMTTM permanezca siempre visible para todos los usuarios.
     - Se incorporó limpieza preventiva en `useEffect` para invalidar claves residuales de `cadensa_amttm_banner_dismissed` en navegadores existentes.
  2. **Alineación Fija Horizontal de Botones de Redes Sociales**:
     - Se eliminó el comportamiento `flex-wrap` en el grupo de botones, fijando un contenedor `flex items-center gap-2.5 flex-shrink-0`.
     - Ambos botones (Facebook y YouTube) poseen idéntico padding vertical (`px-3.5 py-2`), alineación perfecta de isotipos vectoriales y flecha de apertura externa.
  3. **Actualización de Suite de Pruebas**:
     - Actualizado `CommunityBanner.test.tsx` para verificar la permanencia continua del banner y la ausencia de botones de descarte destructivos.
     - 114/114 pruebas unitarias y 59/59 escenarios BDD pasando limpiamente.
- **Archivos creados/modificados**:
  - `src/components/CommunityBanner.tsx`
  - `src/components/CommunityBanner.test.tsx`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Homogeneización de Ancho del Sitio y Auditoría Técnica de Base de Datos en Supabase
- **Detalle**:
  1. **Homogeneización de Anchos y Eliminación de Layout Shift**:
     - Diagnóstico de disparidad entre la vista Home (`max-w-5xl`) y la estación de entrenamiento (`max-w-3xl` / `max-w-xl`).
     - Estandarización de la jerarquía de anchos en todo el sitio:
       - **Marco Global (Navbar y Footer):** `w-full max-w-5xl` (1024px) en ambas vistas, eliminando el desplazamiento horizontal de 128px al navegar.
       - **Estudio de Entrenamiento y Tarjetas Clínicas:** `w-full max-w-4xl` (896px) con acolchado `p-4 sm:p-7`, eliminando el efecto de "túnel" estrecho en pantallas de escritorio.
       - **Secciones de Soporte:** `FaqAndMethodology` y `CommunityBanner` ajustados simétricamente a `max-w-4xl`.
       - **Componentes Fisiológicos:** `TechniqueVisualizer` (rampas, diagramas en 3 etapas) y `SyllableReader` expandidos a `max-w-2xl` para evitar truncamiento de texto.
  2. **Auditoría Técnica y Estado de Supabase**:
     - Inspección directa mediante API PostgREST y GoTrue Auth en el proyecto `kddeejyhnxrnmkmiwjxp`.
     - Hallazgo: El servicio de autenticación está activo y saludable. Sin embargo, las tablas públicas (`public.exercises`, `public.profiles`, `public.training_sessions`, `public.user_streaks`) aún no existen en el esquema remoto (HTTP 404), ya que las migraciones locales (`supabase/migrations/`) no se han ejecutado en PostgreSQL de producción.
     - Diagnóstico de pruebas: No existen datos de prueba en Supabase; las 114 pruebas unitarias y 59 escenarios BDD se ejecutan de manera aislada localmente (Zero-Pollution). La aplicación web continúa operativa mediante su arquitectura resiliente de catálogo local y persistencia en `localStorage`.
  3. **Documentación en LLM Wiki**:
     - Creación de [`wiki/architecture/layout_and_responsive_standards.md`](wiki/architecture/layout_and_responsive_standards.md).
     - Creación de [`wiki/architecture/supabase_audit_and_schema_state.md`](wiki/architecture/supabase_audit_and_schema_state.md) con la guía paso a paso para ejecutar las migraciones SQL en Supabase Dashboard o CLI.
     - Actualización del catálogo central [`wiki/index.md`](wiki/index.md).
- **Archivos creados/modificados**:
  - `src/app/page.tsx`
  - `src/components/CommunityBanner.tsx`
  - `src/components/FaqAndMethodology.tsx`
  - `src/components/SyllableReader.tsx`
  - `src/components/TechniqueVisualizer.tsx`
  - `wiki/architecture/layout_and_responsive_standards.md`
  - `wiki/architecture/supabase_audit_and_schema_state.md`
  - `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Generación de Personal Access Token y Migración Desatendida de Base de Datos en Supabase
- **Detalle**:
  1. **Generación de Credenciales Administrativas**:
     - Acceso asistido vía browser subagent al dashboard oficial (`https://supabase.com/dashboard/account/tokens`).
     - Creación del Personal Access Token (PAT) `cadensa-migrations` (`sbp_...`) con privilegios administrativos para la Management API.
     - Resguardo seguro de credenciales:
       - Configuración en `.env` local (`SUPABASE_ACCESS_TOKEN`), estrictamente protegido en `.gitignore`.
       - Actualización de `.env.example` con la nueva variable documentada.
       - Aprovisionamiento como secreto de repositorio en GitHub Actions (`gh secret set SUPABASE_ACCESS_TOKEN`).
  2. **Pipeline de Migraciones Desatendidas (`scripts/migrate_supabase.cjs`)**:
     - Creación de script de migración automatizada compatible con CI/CD que interactúa con `https://api.supabase.com/v1/projects/{ref}/database/query`.
     - Ejecución ordenada y atómica de los archivos de migración:
       - `20260531140826_init_schema.sql` (creación de tabla `profiles`, trigger `on_auth_user_created`, políticas RLS).
       - `20261023140000_training_and_streaks.sql` (creación de tablas `exercises`, `training_sessions`, `user_streaks`, semillas iniciales de técnicas clínicas y funciones PL/pgSQL).
     - Incorporación del comando `npm run db:migrate` en `package.json`.
     - Integración del paso condicional de migración en `.github/workflows/deploy.yml` para despliegues continuos automáticos.
  3. **Validación y Estado de Salud en Vivo**:
     - Verificación directa contra la API PostgREST (`https://kddeejyhnxrnmkmiwjxp.supabase.co/rest/v1/`):
       - `public.profiles`: ACTIVA (HTTP 200).
       - `public.exercises`: ACTIVA (HTTP 200, 2 ejercicios semilla disponibles).
       - `public.training_sessions`: ACTIVA (HTTP 200).
       - `public.user_streaks`: ACTIVA (HTTP 200).
     - Documentación actualizada en `wiki/architecture/supabase_audit_and_schema_state.md`.
- **Archivos creados/modificados**:
  - `.env.example`
  - `package.json`
  - `scripts/migrate_supabase.cjs`
  - `.github/workflows/deploy.yml`
  - `wiki/architecture/supabase_audit_and_schema_state.md`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Auditoría Integral de Seguridad: Remediación RLS en Supabase y Hardening HTTP
- **Detalle**:
  1. **Remediación de Alerta Crítica en Supabase Security Advisor (`RLS Disabled in Public`)**:
     - Diagnóstico: La tabla interna de control `public._schema_migrations` carecía de Row Level Security (RLS), detonando alerta crítica en el Advisor de Supabase y exponiendo potencialmente el historial de versiones en la API PostgREST.
     - Solución:
       - Creación y ejecución de la migración `20261024170000_security_hardening.sql`.
       - Habilitación de RLS (`ALTER TABLE public._schema_migrations ENABLE ROW LEVEL SECURITY;`).
       - Revocación estricta de privilegios (`REVOKE ALL ON TABLE public._schema_migrations FROM anon, authenticated;`).
       - Verificación: Las consultas anónimas y de usuarios autenticados vía PostgREST retornan HTTP 401 Unauthorized (`permission denied`).
  2. **Hardening de Funciones PostgreSQL (Mitigación search_path Poisoning)**:
     - Detección de la función `handle_new_user()` con `SECURITY DEFINER` y `search_path` mutable.
     - Remediación aplicando `SET search_path = ''`, garantizando que la función trigger de registro no sea vulnerable a manipulación de esquemas.
  3. **Auditoría de Dependencias y Aplicación (`package.json`)**:
     - Ejecución de `npm audit`: 0 vulnerabilidades reportadas.
     - Verificación de variables en cliente: El frontend únicamente consume `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SUPABASE_URL`. Cero exposición de tokens administrativos o claves `service_role`.
     - Adición del script `npm run security:audit` en `package.json` para auditorías automatizadas periódicas.
  4. **Cabeceras de Seguridad HTTP en Cloudflare Pages (`public/_headers`)**:
     - Implementación de `X-Frame-Options: DENY` (anti-clickjacking).
     - `X-Content-Type-Options: nosniff`.
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - `Permissions-Policy`: Restricción estricta de micrófono a `self` (`microphone=(self)`), bloqueando captura de audio desde iframes o dominios de terceros.
     - `Content-Security-Policy`: Definición de directivas seguras para orígenes de Supabase y analíticas.
- **Archivos creados/modificados**:
  - `public/_headers`
  - `package.json`
  - `scripts/migrate_supabase.cjs`
  - `scripts/security_audit.cjs`
  - `supabase/migrations/20261024170000_security_hardening.sql`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-24] ingest | Integración y Verificación de Google Analytics 4, Search Console y Bing Webmaster Tools
- **Detalle**:
  1. **Google Analytics (GA4)**:
     - Creación de la propiedad y flujo de datos web `Cadensa Web` en la cuenta `a389930119` con ID de medición `G-HCTT9146TJ`.
     - Inserción de scripts `gtag.js` en `src/app/layout.tsx` mediante `next/script` optimizado para carga `afterInteractive`.
     - Actualización de CSP en `public/_headers` para permitir orígenes `https://www.googletagmanager.com`, `https://*.google-analytics.com` y `https://*.analytics.google.com`.
  2. **Google Search Console**:
     - Registro de la propiedad con prefijo `https://cadensa-web.pages.dev/`.
     - Implementación de la etiqueta de verificación `<meta name="google-site-verification" content="n2GCgYUYH1CHgZTm_iYkWM-bXqGR7o-c8kXoy3jB5EQ" />` en `src/app/layout.tsx`.
     - Verificación automatizada exitosa confirmada vía navegador (`Ownership verified`).
  3. **Bing Webmaster Tools**:
     - Configuración del sitio `https://cadensa-web.pages.dev/`.
     - Integración del meta tag de autenticación `<meta name="msvalidate.01" content="856757614FFC2C5582FBCB81B1B4E4CA" />` en los encabezados globales.
     - Verificación confirmada en el panel de Bing.
  4. **Despliegue y Validación CI/CD**:
     - Suite completa de 114 pruebas unitarias y 59 escenarios BDD pasando limpiamente.
     - Despliegue en Cloudflare Pages ([Run 40141821613](https://github.com/merolhack/cadensa-web/actions/runs/40141821613)) con HTTP 200 en producción.
- **Archivos creados/modificados**:
  - `src/app/layout.tsx`
  - `public/_headers`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-25] ingest | Pipeline Automatizado de Telemetría Semanal y Página de Estadísticas Globales
- **Detalle**:
  1. **Generación de Credenciales y Acceso Asistido de Cuentas de Servicio**:
     - Creación de la Service Account de Google Cloud `cadensa-metrics-extractor@cadensa-web-dev.iam.gserviceaccount.com`.
     - Habilitación de APIs en Google Cloud: `analyticsdata.googleapis.com` (GA4 Data API) y `searchconsole.googleapis.com` (Search Console API).
     - Generación y resguardo de la clave privada JSON en GitHub Secrets (`GCP_SA_METRICS_KEY`).
     - Asignación de rol Lector (Viewer) a la Service Account en Google Analytics (propiedad `560646502`) y Search Console (`https://cadensa-web.pages.dev/`).
     - Obtención de la clave API de Bing Webmaster Tools (`BING_API_KEY`) y verificación de titularidad del sitio en el panel de Bing.
     - Aprovisionamiento en GitHub Secrets de `GA4_PROPERTY_ID`, `GSC_SITE_URL`, `BING_API_KEY` y `GCP_SA_METRICS_KEY`.
  2. **Script de Agregación de Métricas (`scripts/fetch_platform_metrics.cjs`)**:
     - Conexión vía OAuth2 JWT firmado a Google Analytics Data API para extraer sesiones, usuarios activos, vistas de página y desglose por país (`country`).
     - Conexión a Google Search Console Searchanalytics API para clics, impresiones y CTR.
     - Conexión a Bing Webmaster Tools API para clics e impresiones.
     - Extracción y consolidación normalizada de métricas en `src/data/platform_stats.json`.
  3. **Página Dedicada de Estadísticas e Impacto Global (`src/app/stats/page.tsx`)**:
     - Creación de ruta pública `/stats` optimizada para exportación estática Jamstack.
     - KPIs principales: Usuarios activos, vistas de página, búsquedas orgánicas y duración media de sesión.
     - Módulo de Alcance Internacional con banderas y barras de progreso por país (Francia, Argentina, México, Perú, etc.).
     - Desglose técnico de telemetría por plataforma (GA4, GSC, Bing y Cloudflare Edge).
     - Enlaces de navegación añadidos en el header y footer de `TechniquesCatalogHome.tsx` y en el footer de la vista de práctica de `page.tsx`.
  4. **Orquestación de GitHub Actions (`.github/workflows/weekly-metrics.yml`)**:
     - Cron programado semanalmente (lunes a las 06:00 UTC) y ejecución manual `workflow_dispatch`.
     - Ejecuta la extracción de métricas, detecta cambios en `src/data/platform_stats.json`, y realiza commit y push automático a `main` para re-desplegar Cloudflare Pages sin intervención manual.
- **Archivos creados/modificados**:
  - `scripts/fetch_platform_metrics.cjs`
  - `src/data/platform_stats.json`
  - `src/app/stats/page.tsx`
  - `src/components/TechniquesCatalogHome.tsx`
  - `src/app/page.tsx`
  - `package.json`
  - `.github/workflows/weekly-metrics.yml`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-25] ingest | Creación de Página Acerca de (/about), Sincronización Mandatoria de Roadmap y Referencia del Autor
- **Detalle**:
  1. **Página Pública Acerca de (`src/app/about/page.tsx`)**:
     - Exposición detallada del propósito clínico de Cadensa: compensación de déficits temporales en los ganglios basales mediante el método de Habla Rítmica Silábica (STS), micro-hábitos diarios de 5 minutos, gamificación y arquitectura Zero Trust.
     - Sección de estado del proyecto y hoja de ruta (ROADMAP / TODO): desglose transparente de hitos consolidados (v2.0) y futuros pasos en desarrollo activo (diadococinesia oral, reportes clínicos descargables, Audio Worklet, simulaciones reales y PWA nativa).
     - Perfil completo del autor e impulsor técnico **Lenin Meza** con enlaces verificados a su sitio personal en GitHub Pages (`https://merolhack.github.io`), su perfil en LinkedIn (`http://www.linkedin.com/in/leninmezazarco`), su cuenta de GitHub (`https://github.com/merolhack`) y referencia a su libro *"Playbook de Arquitectura MACH"* (Amazon KDP 2026).
  2. **Regla de Gobernanza de Sincronización Mandatoria**:
     - Formalización en `AGENTS.md` (Regla 7), `wiki/SCHEMA.md` y `wiki/architecture/about_and_roadmap_sync.md`: siempre que se modifique o actualice el ROADMAP o tareas pendientes (TODO), es obligatorio actualizar la página `/about`.
  3. **Integración de Navegación y Enlaces**:
     - Botones y enlaces hacia `/about` incorporados en el header y footer de `TechniquesCatalogHome.tsx`, en el footer de `src/app/page.tsx` y en el header/footer de `src/app/stats/page.tsx`.
  4. **Cobertura de Pruebas Unitarias y BDD**:
     - Suite unitaria en Vitest (`src/app/about/page.test.tsx`): 5 pruebas completadas exitosamente.
     - Escenarios BDD en Cucumber.js (`features/about_page.feature` y `features/step_definitions/about_steps.ts`): 3 escenarios y 11 pasos validados con éxito.
     - Validación integral con `npm run test:all` (119 pruebas unitarias y 62 escenarios BDD / 241 pasos en verde) y compilación estática Next.js exitosa (`npm run build`).
- **Archivos creados/modificados**:
  - `src/app/about/page.tsx`
  - `src/app/about/page.test.tsx`
  - `features/about_page.feature`
  - `features/step_definitions/about_steps.ts`
  - `src/components/TechniquesCatalogHome.tsx`
  - `src/app/page.tsx`
  - `src/app/stats/page.tsx`
  - `AGENTS.md`
  - `wiki/SCHEMA.md`
  - `wiki/index.md`
  - `wiki/architecture/about_and_roadmap_sync.md`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-25] ingest | Incrustación de Video HD y Thumbnail de Técnica STS con Patrón Façade
- **Detalle**:
  1. **Ubicación y Limpieza de Recursos Multimedia**:
     - Almacenamiento de `cadensa_sts_montaje_limpio_final.mp4` (8.75 MB) y `cadensa_sts_portada.png` (4.14 MB) en `public/media/techniques/`.
     - Eliminación de archivos residuales de Windows (`*:Zone.Identifier`, `Thumbs.db`, `desktop.ini`) y blindaje en `.gitignore`.
  2. **Modelado de Datos (`src/lib/clinicalTechniques.ts`)**:
     - Extensión de la interfaz `ClinicalTechnique` con `thumbnailUrl?: string`.
     - Vinculación de `videoUrl` y `thumbnailUrl` en la técnica canónica `sts`.
  3. **Reproductor Nativo con Patrón Façade (`src/components/TechniqueVideoModal.tsx`)**:
     - Implementación de estado declarativo Click-to-Play para cero consumo de ancho de banda hasta la interacción del usuario.
     - Portada optimizada con Next.js `Image`, botón de play glowing y transición fluida a elemento `<video controls playsInline autoPlay />`.
     - Pausa automática y reset de reproducción al cerrar el modal o cambiar de técnica.
  4. **Parrilla de Catálogo en Home (`src/components/TechniquesCatalogHome.tsx`)**:
     - Vista previa interactiva con thumbnail y badge `🎬 Video HD` directamente en la tarjeta de la técnica STS.
  5. **Validación de Calidad**:
     - 120 pruebas unitarias en Vitest (`TechniqueVideoModal.test.tsx` actualizado para validar thumbnail y video).
     - 62 escenarios BDD en Cucumber.js passing al 100%.
     - `npm run lint` y `npm run build` completados con 0 errores y 0 warnings.
- **Archivos creados/modificados**:
  - `public/media/techniques/cadensa_sts_montaje_limpio_final.mp4`
  - `public/media/techniques/cadensa_sts_portada.png`
  - `.gitignore`
  - `src/lib/clinicalTechniques.ts`
  - `src/components/TechniqueVideoModal.tsx`
  - `src/components/TechniqueVideoModal.test.tsx`
  - `src/components/TechniquesCatalogHome.tsx`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-26] ingest | Documentación Modular de Arquitectura Multimedia y Entidad de Medios Técnicos
- **Detalle**:
  1. **Documentación de Arquitectura Multimedia (`multimedia_and_video_facade.md`)**:
     - Formalización del principio clínico-técnico de inclusión de video para técnicas fonoaudiológicas sin penalización de rendimiento.
     - Detalle del Patrón Façade Click-to-Play: portada interactiva con Next.js `Image` (`unoptimized`, relación 16:9 fija, CLS = 0), botón central esmeralda glowing y cero consumo de red hasta la acción del usuario.
     - Montaje reactivo de HTML5 `<video>` con `playsInline` (evita fullscreen involuntario en iOS Safari), streaming HTTP 206 Range desde Cloudflare Pages y limpieza de ciclo de vida (`pause()` y reset de estado en unmount/escape).
  2. **Documentación de Entidad de Medios (`technique_media.md`)**:
     - Especificación canónica de almacenamiento en `public/media/techniques/`.
     - Matriz de codecs y formatos: MP4 H.264/AAC para video (≤ 25 MB) y PNG/WebP 16:9 para posters (≤ 5 MB).
     - Blindaje estricto en `.gitignore` contra contaminación de metadatos NTFS/Windows (`*:Zone.Identifier`, `Thumbs.db`, `desktop.ini`).
     - Tipado TypeScript de `videoUrl` y `thumbnailUrl` en `ClinicalTechnique`.
  3. **Mantenimiento del Catálogo Maestro (`wiki/index.md`)**:
     - Indexación de `multimedia_and_video_facade.md` en Arquitectura y `technique_media.md` en Entidades.
     - Actualización de metadatos globales.
- **Archivos creados/modificados**:
  - `wiki/architecture/multimedia_and_video_facade.md`
  - `wiki/entities/technique_media.md`
  - `wiki/index.md`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).


---

## [2026-10-28] ingest | Auditoría Multi-Plataforma (GA4, GSC, AdSense, Bing) y Plan Maestro de Remediación SEO y Funcional
- **Detalle**:
  1. **Extracción en Vivo de Telemetría y Diagnóstico de Errores**:
     - **Google Analytics 4 (`560646502`)**: Actualización de `src/data/platform_stats.json` (21 usuarios activos, 37 sesiones, 61 vistas de pantalla, 7 países incluyendo Suecia y Estados Unidos). Detección de rebote de 67.57%, ausencia de eventos clínicos personalizados y tráfico 404 hacia `/🐛`.
     - **Google Search Console (`https://cadensa-web.pages.dev/`)**: Inspección de URLs (`urlInspection/index:inspect`). La ruta `/` está indexada (`PASS`), pero `/about` y `/stats` figuran como `NEUTRAL` ("Google no reconoce esta URL") por ausencia de `/sitemap.xml` (HTTP 404) y `robots.txt` propio.
     - **Google AdSense (`adsense.googleapis.com`)**: Detección y remediación inmediata de `SERVICE_DISABLED` (HTTP 403 -> HTTP 200) habilitando la API en el proyecto GCP `cadensa-web-dev`. Identificación de ausencia de `/ads.txt`, meta tag `google-adsense-account` (`ca-pub-2700240339792942`), bloqueo en CSP (`public/_headers`) y páginas YMYL (`/privacy`, `/terms` con aviso médico fonoaudiológico).
     - **Bing Webmaster Tools**: Sitio verificado (`IsVerified: true`), pero `GetUrlInfo` reporta `AnchorCount: 0` y `TotalChildUrlCount: 0` por falta de Sitemap, IndexNow y datos estructurados JSON-LD.
  2. **Planificación Modular y Sincronización Mandatoria**:
     - Creación de `wiki/roadmap/platform_telemetry_and_seo_plan.md` con el diagnóstico completo y el plan de acción en 4 fases (SEO Técnico e IndexNow, Telemetría Clínica GA4, Cumplimiento AdSense/YMYL y Nuevas Funcionalidades Clínicas).
     - Actualización de `wiki/index.md`, `src/app/about/page.tsx` (Hito 6 en hoja de ruta) y `src/app/stats/page.tsx` (soporte para Suecia `🇸🇪`).
- **Archivos creados/modificados**:
  - `src/data/platform_stats.json`
  - `src/app/stats/page.tsx`
  - `src/app/about/page.tsx`
  - `wiki/roadmap/platform_telemetry_and_seo_plan.md`
  - `wiki/index.md`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).


---

## [2026-10-28] ingest | Implementación Integral de SEO Técnico, IndexNow, Cumplimiento AdSense YMYL y Nuevas Funcionalidades
- **Detalle**:
  1. **Fase A: SEO Técnico, Indexación e IndexNow**:
     - Implementación de generadores estáticos `src/app/sitemap.ts` (12 URLs: estáticas + 7 técnicas) y `src/app/robots.ts` apuntando a `https://cadensa-web.pages.dev/sitemap.xml`.
     - Inyección de datos estructurados Schema.org `WebApplication` y `MedicalWebPage` en `src/lib/structuredData.ts` y vinculados en `src/app/layout.tsx`.
     - Archivo de verificación IndexNow (`public/856757614ffc2c5582fbcb81b1b4e4ca.txt`) y script `scripts/submit_seo_index.cjs` que envía URLs y sitemaps a Bing API y protocolo IndexNow (HTTP 202 Aceptado).
     - Creación de página personalizada de error 404 (`src/app/not-found.tsx`) con navegación guiada al catálogo clínico.
  2. **Fase B: Telemetría Clínica GA4 y Monitoreo Avanzado**:
     - Módulo `src/lib/analytics.ts` con función `trackClinicalEvent()` para capturar eventos fonoaudiológicos: `metronome_start`, `metronome_stop`, `technique_select`, `voice_tap_recorded`, `session_completed`, `clinical_report_export`, `simulator_scenario_start`, `routine_5min_start` y `routine_5min_complete`.
     - Actualización de `scripts/fetch_platform_metrics.cjs` para recopilar tasas de rebote, engagement y estado de indexación de GSC.
     - Actualización de `src/app/stats/page.tsx` con soporte para Suecia (`🇸🇪`), tarjetas de salud de indexación y métricas de 30 días.
  3. **Fase C: Cumplimiento AdSense & Salud YMYL**:
     - Archivo oficial `public/ads.txt` configurado con `google.com, pub-2700240339792942, DIRECT, f08c47fec0942fa0`.
     - Etiqueta meta `<meta name="google-adsense-account" content="ca-pub-2700240339792942" />` en `src/app/layout.tsx`.
     - Actualización de directivas CSP en `public/_headers` autorizando orígenes de Google Ads y AdSense (`googlesyndication.com`, `doubleclick.net`).
     - Creación de páginas obligatorias de **Política de Privacidad (`src/app/privacy/page.tsx`)** (Zero Trust, Web Audio API y cookies analíticas/anuncios) y **Términos de Uso (`src/app/terms/page.tsx`)** con **Descargo Médico Fonoaudiológico (Medical Disclaimer YMYL)**.
  4. **Fase D: Nuevas Funcionalidades Clínicas y Crecimiento Orgánico**:
     - **Páginas Estáticas por Técnica (`src/app/tecnicas/[id]/page.tsx`)**: 7 rutas SSG (`sts`, `easy_onset`, `light_contact`, `prolonged_speech`, `box_breathing`, `pull_out`, `cancellation`) con protocolo clínico detallado, preguntas frecuentes y botón directo de entrenamiento.
     - **Simulador de Situaciones Reales (`src/components/RealWorldSimulator.tsx` / `src/lib/realWorldScenarios.ts`)**: 4 escenarios cotidianos de presión (Llamada para Cita Médica, Presentación en Equipo, Pedido en Restaurante y Entrevista de Trabajo) con respuestas graduadas y asignación de técnica recomendada.
     - **Rutina Guiada de 5 Minutos (`src/components/QuickDailyRoutine.tsx`)**: Asistente con temporizador progresivo (1 min Respiración Diafragmática 4-4-4-4 + 2 min Easy Onset + 2 min STS) para reducir la tasa de rebote del nuevo usuario.
     - Integración de accesos en `src/components/TechniquesCatalogHome.tsx` y enlaces a guías individuales en las tarjetas.
  5. **Gobernanza y Suite de Pruebas**:
     - Actualización de la hoja de ruta en `src/app/about/page.tsx`.
     - 130 pruebas unitarias en Vitest (`27/27 suites`) y 65 escenarios BDD en Cucumber (`251 pasos`) pasando al 100%.
     - Linter de ESLint con 0 errores y 0 advertencias.
     - Compilación estática Next.js Turbopack (`out/`) completada con éxito generando todas las páginas HTML y recursos estáticos.
- **Archivos creados/modificados**:
  - `src/lib/structuredData.ts`, `src/lib/analytics.ts`, `src/lib/analytics.test.ts`
  - `src/lib/realWorldScenarios.ts`, `src/components/RealWorldSimulator.tsx`
  - `src/components/QuickDailyRoutine.tsx`, `src/components/clinical_features.test.tsx`
  - `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`
  - `src/app/layout.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`
  - `src/app/legal_and_404.test.tsx`, `src/app/tecnicas/[id]/page.tsx`, `src/app/tecnicas/[id]/page.test.tsx`
  - `src/components/TechniquesCatalogHome.tsx`, `src/components/Dashboard.tsx`, `src/app/page.tsx`, `src/app/stats/page.tsx`, `src/app/about/page.tsx`
  - `public/ads.txt`, `public/_headers`, `public/856757614ffc2c5582fbcb81b1b4e4ca.txt`
  - `scripts/fetch_platform_metrics.cjs`, `scripts/submit_seo_index.cjs`
  - `features/seo_adsense_and_clinical_features.feature`, `features/step_definitions/seo_and_clinical_features_steps.ts`
  - `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-28] — Implementación del Sistema de Feedback Comunitario y Calidad Clínica (Zero-Leak RLS)
- **Tipo de Operación**: `FEATURE` / `DATABASE` / `SECURITY` / `TESTS`
- **Descripción**:
  1. **Migración Supabase PostgreSQL (`supabase/migrations/20261028180000_feedback_reports.sql`)**:
     - Creación de tabla `public.feedback_reports` con tipado estricto, checks de categorías (`video_issue`, `technique_issue`, `suggestion`, `other`), longitud de mensaje (10 a 1,000 caract.), regex de email opcional y metadatos JSONB.
     - Implementación de políticas Row Level Security (Zero-Leak / Blind-Drop):
       - `INSERT` permitido para `anon` y `authenticated` con validación estricta de identidad contra suplantación (`auth.uid() = user_id`).
       - `SELECT` restringido confidencialmente (`auth.uid() = user_id` para usuarios autenticados, denegado por omisión a clientes anónimos).
     - Aplicación desatendida y verificación exitosa vía PostgREST con `scripts/migrate_supabase.cjs`.
  2. **Servicio Clínico en Cliente (`src/lib/feedbackService.ts`)**:
     - Validación de longitud y formato de correo.
     - Detección de trampa anti-spam invisible (Honeypot) con éxito simulado para neutralizar bots.
     - Control de cuota (Rate Limiting) de hasta 3 envíos por hora en `localStorage`.
     - Resiliencia Offline-First: almacenamiento automático en cola local (`cadensa_offline_feedback`) en caso de desconexión o fallo temporal de red.
     - Emisión de telemetría GA4 `trackClinicalEvent('feedback_submitted', ...)`.
  3. **Componentes de Interfaz**:
     - `src/components/FeedbackModal.tsx`: Modal accesible WCAG 2.1 AA con selector de categoría, técnica relacionada, contador de caracteres y mensajes de confirmación.
     - Integración en `src/components/TechniqueVideoModal.tsx`: botón directo "💬 Reportar falla o duda en este video" con técnica y categoría preseleccionadas.
     - `src/components/TechniqueFeedbackButton.tsx`: Botón cliente insertado en las guías individuales SSG (`src/app/tecnicas/[id]/page.tsx`).
     - Botón accesible en el footer global de `src/app/page.tsx`.
  4. **Sincronización de Gobernanza y Hoja de Ruta**:
     - Actualización mandatoria de `src/app/about/page.tsx` reflejando el nuevo canal de feedback y calidad clínica como hito completado.
     - Creación de `wiki/concepts/feedback_and_quality_reports.md` y actualización de `wiki/index.md`.
  5. **Batería de Pruebas**:
     - 143 pruebas unitarias Vitest en 30 suites pasando al 100%.
     - 69 escenarios BDD en Cucumber (`266 pasos`) en español pasando al 100%.
     - ESLint y TypeCheck (`next build`) con 0 errores y 0 advertencias.
- **Archivos creados/modificados**:
  - `supabase/migrations/20261028180000_feedback_reports.sql`
  - `scripts/migrate_supabase.cjs`
  - `src/types/supabase.ts`
  - `src/lib/feedbackService.ts`, `src/lib/feedbackService.test.ts`
  - `src/lib/analytics.ts`
  - `src/components/FeedbackModal.tsx`, `src/components/FeedbackModal.test.tsx`
  - `src/components/TechniqueVideoModal.tsx`, `src/components/TechniqueVideoModal.test.tsx`
  - `src/components/TechniqueFeedbackButton.tsx`, `src/components/TechniqueFeedbackButton.test.tsx`
  - `src/app/page.tsx`, `src/app/tecnicas/[id]/page.tsx`, `src/app/about/page.tsx`
  - `features/feedback_reporting.feature`, `features/step_definitions/feedback_steps.ts`
  - `wiki/concepts/feedback_and_quality_reports.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-28] — Implementación del Dashboard Privado de Administración y Gobierno Clínico (/admin)
- **Tipo de Operación**: `FEATURE` / `DATABASE` / `SECURITY` / `TESTS`
- **Descripción**:
  1. **Migración Supabase PostgreSQL (`supabase/migrations/20261028200000_admin_roles_and_metrics.sql`)**:
     - Creación de tabla `public.app_admins` con clave foránea a `auth.users(id)` y roles `admin` y `clinical_director`.
     - Implementación de función `public.is_admin()` (`SECURITY DEFINER`, `search_path = public`) para evitar ataques de inyección y bucles de recursión en RLS.
     - Creación de tabla de snapshots de telemetría `public.platform_metrics_snapshots`.
     - Políticas RLS Zero Trust:
       - Solo administradores pueden consultar (`SELECT`) y actualizar (`UPDATE`) la totalidad de los reportes en `feedback_reports`.
       - Solo administradores pueden consultar todos los perfiles de `profiles`, sesiones de `training_sessions` y rachas de `user_streaks`.
       - Registro y verificación de las tablas con `scripts/migrate_supabase.cjs` (7 tablas activas).
  2. **Servicio de Administración (`src/lib/adminService.ts`)**:
     - Función `checkIsAdmin()` para comprobación de rol mediante RPC o tabla `app_admins`.
     - `fetchAdminFeedbackReports()` con filtrado dinámico por categoría y estado.
     - `updateFeedbackReportStatus()` para moderar y resolver incidencias fonoaudiológicas.
     - `fetchAdminUsersList()` y `fetchAdminSummary()` para consolidar KPIs de adherencia.
     - Envoltorio de resiliencia `withNetworkTimeout` (1,200 ms) para prevenir bloqueos por latencia de red.
  3. **Consola Administrativa de Interfaz (`src/app/admin/page.tsx`)**:
     - Pantalla de guardia de acceso restringido (403) con flujo de inicio de sesión integrado para administradores.
     - Pestaña 1: Bandeja de Calidad y Feedback con acciones rápidas (Revisar, Resolver, Descartar).
     - Pestaña 2: Directorio de Usuarios con rachas consecutivas, minutos acumulados y puntos XP.
     - Pestaña 3: Métricas de Tráfico de GA4, Google Search Console, Bing Webmaster e IndexNow.
     - Pestaña 4: Diagnóstico Fonoaudiológico, calibración de metrónomo y cumplimiento YMYL/AdSense.
     - Enlace discreto de acceso a `/admin` en el pie de página de la aplicación principal.
  4. **Gobernanza y Sincronización de Hoja de Ruta**:
     - Actualización de `src/app/about/page.tsx` reflejando el nuevo panel de control como hito completado.
     - Ingesta de `wiki/architecture/admin_dashboard.md` y actualización del catálogo `wiki/index.md`.
  5. **Batería de Pruebas**:
     - 153 pruebas unitarias Vitest en 32 suites pasando al 100%.
     - 73 escenarios BDD en Cucumber (`281 pasos`) en español pasando al 100%.
     - Compilación estática Next.js Turbopack generando 18 rutas limpiamente sin errores.
     - ESLint con 0 errores y 0 advertencias.
- **Archivos creados/modificados**:
  - `supabase/migrations/20261028200000_admin_roles_and_metrics.sql`
  - `scripts/migrate_supabase.cjs`
  - `src/types/supabase.ts`
  - `src/lib/adminService.ts`, `src/lib/adminService.test.ts`
  - `src/app/admin/page.tsx`, `src/app/admin/page.test.tsx`
  - `src/app/page.tsx`, `src/app/about/page.tsx`
  - `features/admin_dashboard.feature`, `features/step_definitions/admin_steps.ts`
  - `wiki/architecture/admin_dashboard.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

---

## [2026-10-28] — Implementación de las 5 Capacidades Estratégicas: Frases Desafío, Auto-Escucha Local, CMS de Ejercicios, Exportación CSV y PWA
- **Tipo de Operación**: `FEATURE` / `SECURITY` / `DATABASE` / `TESTS`
- **Descripción**:
  1. **Frases Personalizadas de Desafío ("Mis Frases de Desafío")**:
     - Componente interactivo `src/components/CustomPhraseTrainer.tsx` con silabador ortográfico en tiempo real (`flattenSentenceSyllables`).
     - Almacenamiento y persistencia en `localStorage` (`cadensa_custom_phrases`) con privacidad Zero Trust.
     - 5 plantillas fonoaudiológicas para situaciones cotidianas de alta demanda comunicativa (pedir café, llamadas telefónicas, entrevistas laborales, compras y direcciones).
     - Pruebas unitarias completas en `src/components/CustomPhraseTrainer.test.tsx`.
  2. **Auto-Escucha Fonoaudiológica Local (Self-Monitoring Zero Trust)**:
     - Componente `src/components/AudioSelfMonitor.tsx` basado en `MediaRecorder API` y `navigator.mediaDevices.getUserMedia`.
     - Grabación de voz en memoria local (`Blob`) con temporizador y reproductor auditivo diferido para autoevaluación propioceptiva y de cadencia.
     - Aislamiento estricto: ningún byte de voz se envía a la red ni a servidores externos.
     - Pruebas unitarias completas en `src/components/AudioSelfMonitor.test.tsx`.
  3. **Gestor de Ejercicios Clínicos en Vivo (CMS Supabase)**:
     - Migración `supabase/migrations/20261028210000_exercise_cms_policies.sql` habilitando políticas RLS para administradores sobre `public.exercises`.
     - Nueva pestaña "Editor de Ejercicios CMS" en `src/app/admin/page.tsx` para consultar, añadir oraciones y eliminar ejercicios en tiempo real sin desplegar código.
     - Funciones `fetchAdminExercises`, `createAdminExercise` y `deleteAdminExercise` en `src/lib/adminService.ts`.
     - Pruebas unitarias en `src/lib/adminService.test.ts` y `src/app/admin/page.test.tsx`.
  4. **Exportador CSV de Calidad y Adherencia**:
     - Botones de exportación con 1 clic en la consola administrativa para `cadensa_feedback_YYYY-MM-DD.csv` y `cadensa_usuarios_YYYY-MM-DD.csv`.
     - Funciones cliente `generateFeedbackCSV()` y `generateUsersCSV()` serializando campos clave de moderación y telemetría de práctica.
  5. **PWA Instalable Offline-First**:
     - Componente `src/components/PwaInstallButton.tsx` con escucha del evento `beforeinstallprompt` y detección de modo `standalone`.
     - Soporte en `public/manifest.json` y `public/sw.js` para entrenamiento con metrónomo y silabador sin conexión.
     - Pruebas unitarias en `src/components/PwaInstallButton.test.tsx`.
  6. **Gobernanza, BDD y Sincronización Mandatoria de `/about`**:
     - Actualización de hitos completados y nuevos pasos en `src/app/about/page.tsx`.
     - Escenarios BDD en español `features/custom_phrases_and_cms.feature` y `features/step_definitions/custom_phrases_and_cms_steps.ts`.
     - Ingesta en LLM Wiki: `wiki/concepts/custom_phrases_training.md`, `wiki/concepts/audio_self_monitoring.md`, `wiki/architecture/exercises_cms_and_export.md`, y actualización de `wiki/index.md`.
     - 174 pruebas unitarias Vitest y 78 escenarios Cucumber BDD pasando al 100%.
- **Archivos creados/modificados**:
  - `supabase/migrations/20261028210000_exercise_cms_policies.sql`
  - `src/components/CustomPhraseTrainer.tsx`, `src/components/CustomPhraseTrainer.test.tsx`
  - `src/components/AudioSelfMonitor.tsx`, `src/components/AudioSelfMonitor.test.tsx`
  - `src/components/PwaInstallButton.tsx`, `src/components/PwaInstallButton.test.tsx`
  - `src/lib/adminService.ts`, `src/lib/adminService.test.ts`
  - `src/app/admin/page.tsx`, `src/app/admin/page.test.tsx`
  - `src/app/page.tsx`, `src/app/page.test.tsx`
  - `src/components/TechniquesCatalogHome.tsx`
  - `src/app/about/page.tsx`, `src/app/about/page.test.tsx`
  - `features/custom_phrases_and_cms.feature`, `features/step_definitions/custom_phrases_and_cms_steps.ts`
  - `wiki/concepts/custom_phrases_training.md`, `wiki/concepts/audio_self_monitoring.md`
  - `wiki/architecture/exercises_cms_and_export.md`, `wiki/index.md`, `wiki/log.md`
- **Autor**: LLM Pair Programmer (Antigravity).

