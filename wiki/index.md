# Catálogo Maestro del LLM Wiki — Cadensa

> **Índice de Contenidos y Navegación Rápida**  
> Última actualización: 2026-10-28  
> Esquema de gobernanza: [SCHEMA.md](SCHEMA.md) | Bitácora de operaciones: [log.md](log.md)

Este catálogo resume e indexa de forma modular todas las páginas del conocimiento persistente de Cadensa. Los agentes LLM deben consultar este índice como paso previo antes de explorar páginas individuales.

---

## 🏛️ Gobernanza & Operaciones

| Documento | Descripción Breve | Categoría |
|---|---|---|
| [SCHEMA.md](SCHEMA.md) | Reglas de gobierno, las 3 capas del wiki y protocolos Ingest/Query/Lint para LLMs. | `governance` |
| [log.md](log.md) | Registro cronológico append-only de modificaciones, ingestas y auditorías. | `log` |

---

## 🏗️ Arquitectura del Sistema (`wiki/architecture/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [overview.md](architecture/overview.md) | Visión holística de la arquitectura Jamstack desacoplada: Edge CDN + BaaS + Zero Trust. | `architecture`, `jamstack`, `overview` |
| [frontend.md](architecture/frontend.md) | Implementación en Next.js 16, React 19, Tailwind CSS v4, exportación estática y Client Components. | `frontend`, `nextjs`, `react`, `tailwind` |
| [backend_database.md](architecture/backend_database.md) | Diseño de base de datos en Supabase PostgreSQL, funciones PL/pgSQL, triggers y tipado estricto. | `backend`, `database`, `supabase`, `rls` |
| [cicd_deployment.md](architecture/cicd_deployment.md) | Automatización del ciclo de vida con GitHub Actions y despliegue inmutable a Cloudflare Pages. | `cicd`, `github-actions`, `cloudflare-pages` |
| [containerization.md](architecture/containerization.md) | Contenedor Docker multi-stage con Node 20 Slim + Nginx Alpine y configuración de SPA. | `docker`, `containers`, `nginx` |
| [testing.md](architecture/testing.md) | Pirámide de pruebas unitarias con Vitest y escenarios BDD con Cucumber y Gherkin. | `testing`, `vitest`, `cucumber`, `bdd` |
| [audio_engine.md](architecture/audio_engine.md) | Motor de metrónomo de precisión Web Audio API, scheduler lookahead y sincronía visual. | `web-audio`, `metronome`, `timing` |
| [audio_worklet_low_latency.md](architecture/audio_worklet_low_latency.md) | Procesador Audio Worklet en hilo independiente (<5ms) para detección VAD y sincronía foniátrica. | `web-audio`, `audio-worklet`, `vad`, `latency` |
| [telehealth_p2p_webrtc.md](architecture/telehealth_p2p_webrtc.md) | Telesalud fonoaudiológica P2P cifrada E2EE y sincronización de metrónomo por WebRTC DataChannel. | `webrtc`, `telehealth`, `e2ee`, `datachannel` |
| [cross_browser_compatibility.md](architecture/cross_browser_compatibility.md) | Compatibilidad multi-navegador (Chromium, WebKit, Gecko), safe areas, desbloqueo de audio y pruebas con Playwright. | `cross-browser`, `playwright`, `safari`, `firefox`, `edge` |
| [multi_device_cloud_sync.md](architecture/multi_device_cloud_sync.md) | Sincronización multi-dispositivo de frases de desafío con Supabase PostgreSQL Zero Trust RLS. | `supabase`, `sync`, `zero-trust`, `rls` |
| [auth_and_data_budget.md](architecture/auth_and_data_budget.md) | Diagnóstico de GitHub Actions, flujos OAuth/Magic Link, Soft Confirmation y dimensionamiento de datos por usuario. | `auth`, `oauth`, `ci-cd`, `database-budget` |
| [layout_and_responsive_standards.md](architecture/layout_and_responsive_standards.md) | Jerarquía de anchos homogéneos (max-w-5xl marco exterior, max-w-4xl contenido central, max-w-2xl componentes). | `frontend`, `layout`, `responsive`, `design-system` |
| [supabase_audit_and_schema_state.md](architecture/supabase_audit_and_schema_state.md) | Diagnóstico de tablas en Supabase, estado 404 del schema cache, aislamiento de pruebas y guía de migración SQL. | `supabase`, `database`, `audit`, `migrations` |
| [admin_dashboard.md](architecture/admin_dashboard.md) | Arquitectura del Dashboard Privado (/admin), modelo de roles RBAC en PostgreSQL, Zero Trust RLS y telemetría unificada. | `admin`, `security`, `rbac`, `zero-trust`, `rls` |
| [exercises_cms_and_export.md](architecture/exercises_cms_and_export.md) | CMS ligero en Supabase sobre public.exercises, exportación CSV cliente y soporte PWA offline. | `architecture`, `cms`, `csv`, `pwa`, `rls` |
| [hl7_fhir_interoperability.md](architecture/hl7_fhir_interoperability.md) | Interoperabilidad fonoaudiológica bajo estándar internacional HL7 FHIR R4 (DiagnosticReport, LOINC 77150-1, SNOMED-CT). | `fhir`, `interoperability`, `loinc`, `snomed-ct`, `ehr` |
| [about_and_roadmap_sync.md](architecture/about_and_roadmap_sync.md) | Arquitectura de la página Acerca de (/about), perfil del autor Lenin Meza y regla mandatoria de sincronización de TODO/ROADMAP. | `about`, `roadmap`, `governance`, `author` |
| [multimedia_and_video_facade.md](architecture/multimedia_and_video_facade.md) | Reproducción de video nativo con patrón Façade, cero CLS, lazy transfer y streaming HTTP 206. | `architecture`, `multimedia`, `video`, `player`, `performance` |

---

## 💡 Conceptos Clínicos & Patrones (`wiki/concepts/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [clinical_techniques_overview.md](concepts/clinical_techniques_overview.md) | Compendio y taxonomía de las 7 técnicas fonoaudiológicas: Fluency Shaping, Van Riper y Regulación Autónoma. | `clinical`, `overview`, `speech-therapy`, `fluency` |
| [syllable_timed_speech.md](concepts/syllable_timed_speech.md) | Fundamento clínico del habla rítmica silábica (STS), compensación de ganglios basales y fases de fluidez. | `clinical`, `speech-therapy`, `rhythm` |
| [clinical_report_and_jitter.md](concepts/clinical_report_and_jitter.md) | Generador de informe fonoaudiológico formal en PDF, métrica de jitter vocal inter-silábico y niveles de adherencia. | `clinical`, `reporting`, `jitter`, `pdf-export` |
| [altered_auditory_feedback_daf_faf.md](concepts/altered_auditory_feedback_daf_faf.md) | Fundamento neurobiológico y procesador acústico de retroalimentación auditiva retardada (DAF) y alterada en tono (FAF). | `clinical`, `daf`, `faf`, `altered-auditory-feedback`, `choral-effect` |
| [clinical_certificates_and_positive_reinforcement.md](concepts/clinical_certificates_and_positive_reinforcement.md) | Diplomas fonoaudiológicos de mérito y refuerzo positivo contingente para adherencia y reducción de ansiedad vocal. | `clinical`, `gamification`, `certificates`, `positive-reinforcement` |
| [diadochokinesis_assessment.md](concepts/diadochokinesis_assessment.md) | Evaluación estandarizada de diadococinesia oral (/pa-ta-ka/), tasa articulatoria (síl/s) y regularidad temporal. | `clinical`, `diadochokinesis`, `ddk`, `speech-therapy` |
| [phonetic_recognition_on_device.md](concepts/phonetic_recognition_on_device.md) | Validador fonético on-device Zero Trust comparando la articulación real vs frase objetivo. | `clinical`, `phonetic`, `zero-trust`, `levenshtein` |
| [formant_acoustics_biofeedback.md](concepts/formant_acoustics_biofeedback.md) | Biofeedback visual 2D de formantes F1/F2 para apertura mandibular y posición lingual. | `clinical`, `formants`, `biofeedback`, `acoustics` |
| [pediatric_fluency_gamification.md](concepts/pediatric_fluency_gamification.md) | Fluidez pediátrica gamificada para niños con avatares acústicos (Tortuga Zen, Castor, Colibrí). | `clinical`, `pediatric`, `gamification`, `children` |
| [easy_onset.md](concepts/easy_onset.md) | Inicio Vocal Suave: descomposición en 3 pasos (suspiro, subida, fonación) y control del espasmo aductor. | `clinical`, `easy-onset`, `laryngeal-control` |
| [light_articulatory_contact.md](concepts/light_articulatory_contact.md) | Contacto Articular Ligero: despresurización de consonantes oclusivas (/p, t, k, b, d, g/) y tacto de pluma (≤30%). | `clinical`, `light-contact`, `articulation`, `plosives` |
| [prolonged_speech.md](concepts/prolonged_speech.md) | Habla Prolongada y Fonación Continua: ligado vocal en legato (2.2s), eliminación de cortes glóticos y escala 2×. | `clinical`, `prolonged-speech`, `legato` |
| [box_breathing.md](concepts/box_breathing.md) | Respiración Cuadrada Diafragmática (4-4-4-4): estimulación del nervio vago y prevención del habla sin reserva aérea. | `clinical`, `breathing`, `autonomic-nervous-system` |
| [pull_out_technique.md](concepts/pull_out_technique.md) | Desactivación Activa en Bloqueo (Pull-Out de Van Riper): 3 etapas para congelar la fuerza, aflojar y deslizar. | `clinical`, `pull-out`, `van-riper`, `stuttering-modification` |
| [cancellation_technique.md](concepts/cancellation_technique.md) | Cancelación Post-Bloqueo de Van Riper: pausa reflexiva de 3s para cortar el reflejo de escape y reintentar con inicio suave. | `clinical`, `cancellation`, `van-riper`, `post-block` |
| [feedback_and_quality_reports.md](concepts/feedback_and_quality_reports.md) | Canal de retroalimentación comunitaria y reporte de errores en videos y técnicas con patrón Zero-Leak RLS. | `feedback`, `quality`, `clinical-telemetry`, `zero-trust`, `rls` |
| [custom_phrases_training.md](concepts/custom_phrases_training.md) | Entrenamiento personalizado de frases de desafío, palabras temidas y silabación STS local. | `clinical`, `custom-phrases`, `sts`, `local-storage` |
| [audio_self_monitoring.md](concepts/audio_self_monitoring.md) | Auto-escucha propioceptiva diferida con MediaRecorder API y aislamiento de audio Zero Trust. | `clinical`, `audio`, `self-monitoring`, `zero-trust` |
| [zero_trust_rls.md](concepts/zero_trust_rls.md) | Seguridad delegada a PostgreSQL: por qué el cliente es untrusted y cómo opera Row Level Security. | `security`, `postgres`, `rls`, `zero-trust` |
| [static_spa_paradigm.md](concepts/static_spa_paradigm.md) | Justificación técnica de `output: 'export'`, eliminación de servidores Node.js y restricciones. | `jamstack`, `spa`, `performance`, `edge` |

---

## 🧩 Entidades & Componentes (`wiki/entities/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [supabase.md](entities/supabase.md) | Instancia singleton del cliente, variables de entorno requeridas y flujo de Supabase CLI. | `entities`, `supabase`, `postgres`, `auth` |
| [cloudflare_pages.md](entities/cloudflare_pages.md) | Infraestructura de edge hosting Anycast, configuración del action y distribución global. | `entities`, `cloudflare`, `hosting`, `edge` |
| [profiles_table.md](entities/profiles_table.md) | Esquema de la tabla `public.profiles`, foreign keys en cascada, triggers y políticas RLS. | `entities`, `database`, `schema`, `profiles` |
| [technique_media.md](entities/technique_media.md) | Estructura de activos de video y pósters (H.264/AAC, PNG/WebP 16:9), cuotas y blindaje contra archivos residuales de SO. | `entities`, `media`, `video`, `storage` |

---

## 🚀 Producto & Roadmap (`wiki/roadmap/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [activity_plan.md](roadmap/activity_plan.md) | Plan maestro detallado en 6 fases con desglose de actividades, criterios de calidad y entregables. | `roadmap`, `planning`, `backlog`, `activities` |
| [evolution_v2_plan.md](roadmap/evolution_v2_plan.md) | Plan de evolución v2: 10 mejoras clínicas, banner comunitario AMTTM y optimizaciones de audio y accesibilidad. | `roadmap`, `evolution`, `community`, `features` |
| [next_steps_plan.md](roadmap/next_steps_plan.md) | Plan de siguientes pasos para evolución clínica: ejercicios fonéticos, reportes para fonoaudiólogos y análisis vocal. | `roadmap`, `clinical`, `reporting`, `next-steps` |
| [product_evolution.md](roadmap/product_evolution.md) | Ruta de evolución técnica del PoC actual hacia el MVP interactivo (Web Audio, silabador, rachas). | `roadmap`, `product`, `mvp`, `audio` |
| [platform_telemetry_and_seo_plan.md](roadmap/platform_telemetry_and_seo_plan.md) | Auditoría de métricas y errores en GA4, Search Console, AdSense y Bing Webmaster Tools, con plan de remediación y nuevas funcionalidades. | `roadmap`, `analytics`, `seo`, `adsense`, `bing` |

---

## 📂 Fuentes Crudas Inmutables (`wiki/raw/`)

| Documento | Descripción Breve | Tipo de Fuente |
|---|---|---|
| [clinical_foundations.md](raw/clinical_foundations.md) | Documento original sobre la terapia del habla, técnica de metrónomo y problema de abandono. | `clinical-spec` |
| [poc_specifications.md](raw/poc_specifications.md) | Requisitos originales de ingeniería, decisiones de stack y restricciones del PoC. | `engineering-spec` |
