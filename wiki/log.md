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
