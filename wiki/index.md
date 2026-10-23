# Catálogo Maestro del LLM Wiki — Cadensa

> **Índice de Contenidos y Navegación Rápida**  
> Última actualización: 2026-10-23  
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
| [auth_and_data_budget.md](architecture/auth_and_data_budget.md) | Diagnóstico de GitHub Actions, flujos OAuth/Magic Link, Soft Confirmation y dimensionamiento de datos por usuario. | `auth`, `oauth`, `ci-cd`, `database-budget` |

---

## 💡 Conceptos Clínicos & Patrones (`wiki/concepts/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [syllable_timed_speech.md](concepts/syllable_timed_speech.md) | Fundamento clínico del habla rítmica silábica, compensación de ganglios basales y fases de fluidez. | `clinical`, `speech-therapy`, `rhythm` |
| [zero_trust_rls.md](concepts/zero_trust_rls.md) | Seguridad delegada a PostgreSQL: por qué el cliente es untrusted y cómo opera Row Level Security. | `security`, `postgres`, `rls`, `zero-trust` |
| [static_spa_paradigm.md](concepts/static_spa_paradigm.md) | Justificación técnica de `output: 'export'`, eliminación de servidores Node.js y restricciones. | `jamstack`, `spa`, `performance`, `edge` |

---

## 🧩 Entidades & Componentes (`wiki/entities/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [supabase.md](entities/supabase.md) | Instancia singleton del cliente, variables de entorno requeridas y flujo de Supabase CLI. | `entities`, `supabase`, `postgres`, `auth` |
| [cloudflare_pages.md](entities/cloudflare_pages.md) | Infraestructura de edge hosting Anycast, configuración del action y distribución global. | `entities`, `cloudflare`, `hosting`, `edge` |
| [profiles_table.md](entities/profiles_table.md) | Esquema de la tabla `public.profiles`, foreign keys en cascada, triggers y políticas RLS. | `entities`, `database`, `schema`, `profiles` |

---

## 🚀 Producto & Roadmap (`wiki/roadmap/`)

| Documento | Descripción Breve | Etiquetas |
|---|---|---|
| [activity_plan.md](roadmap/activity_plan.md) | Plan maestro detallado en 6 fases con desglose de actividades, criterios de calidad y entregables. | `roadmap`, `planning`, `backlog`, `activities` |
| [evolution_v2_plan.md](roadmap/evolution_v2_plan.md) | Plan de evolución v2: 10 mejoras clínicas, banner comunitario AMTTM y optimizaciones de audio y accesibilidad. | `roadmap`, `evolution`, `community`, `features` |
| [next_steps_plan.md](roadmap/next_steps_plan.md) | Plan de siguientes pasos para evolución clínica: ejercicios fonéticos, reportes para fonoaudiólogos y análisis vocal. | `roadmap`, `clinical`, `reporting`, `next-steps` |
| [product_evolution.md](roadmap/product_evolution.md) | Ruta de evolución técnica del PoC actual hacia el MVP interactivo (Web Audio, silabador, rachas). | `roadmap`, `product`, `mvp`, `audio` |

---

## 📂 Fuentes Crudas Inmutables (`wiki/raw/`)

| Documento | Descripción Breve | Tipo de Fuente |
|---|---|---|
| [clinical_foundations.md](raw/clinical_foundations.md) | Documento original sobre la terapia del habla, técnica de metrónomo y problema de abandono. | `clinical-spec` |
| [poc_specifications.md](raw/poc_specifications.md) | Requisitos originales de ingeniería, decisiones de stack y restricciones del PoC. | `engineering-spec` |
