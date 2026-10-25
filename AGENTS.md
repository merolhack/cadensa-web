<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Cadensa - Reglas de Operación para Agentes LLM & Desarrolladores

**Bienvenido a Cadensa.** Este documento establece las directrices obligatorias y protocolos de desarrollo asistido por IA para el repositorio.

---

## 🛠️ Herramientas y Protocolos Obligatorios

### 1. Codebase Memory MCP (`codebase-memory`)
Este proyecto está indexado y gestionado a través de **codebase-memory**:
- **Nombre del Proyecto:** `home-merolhack-fl-cadensa-web`
- **Ruta Raíz:** `/home/merolhack/fl/cadensa-web`
- **Regla de Prioridad:** SIEMPRE prefiere las herramientas de grafo (`search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, `get_architecture`) antes de recurrir a búsquedas ciegas de texto con `grep` o `glob`.
- Si se modifican archivos clave o la estructura de la aplicación, reindexa el proyecto mediante `index_repository(name="home-merolhack-fl-cadensa-web", repo_path="/home/merolhack/fl/cadensa-web")`.

### 2. Delegación a Modelos Secundarios (`ollama-local`)
Para optimizar el contexto y los recursos, delega cualquier tarea mecánica, repetitiva o de bajo riesgo (generación de fixtures, docstrings, boilerplate, formateos simples) a la herramienta `consultar_modelo_local`:
- **Jerarquía Obligatoria:**
  1. **`gemma4:cloud`:** Modelo prioritario cloud si hay cuota semanal disponible (< 90%).
  2. **`qwen3:8b-8k`:** Fallback automático local si la nube falla o excede cuota.
- **No delegar:** Decisiones de arquitectura, cambios multi-archivo o lógica crítica clínica y de seguridad.

### 3. LLM Wiki Persistente y Modular (`wiki/`)
El repositorio utiliza una base de conocimiento persistente en `wiki/` basada en el patrón de Andrej Karpathy:
- **Prohibido:** Crear monolitos o volcar toda la documentación en un solo archivo.
- **Estructura en 3 capas:**
  - **Fuentes Crudas (`wiki/raw/`):** Inmutables (papers médicos, specs originales).
  - **Wiki Modular (`wiki/`):** Páginas interconectadas de arquitectura, conceptos, entidades y roadmap.
  - **Esquema de Gobierno (`wiki/SCHEMA.md`):** Reglas operativas Ingest, Query y Lint.
- **Navegación:** Consulta siempre [`wiki/index.md`](wiki/index.md) como primer paso antes de resolver dudas.
- **Bitácora:** Todo cambio de arquitectura o adición de capacidades debe registrarse cronológicamente en [`wiki/log.md`](wiki/log.md).

### 4. Cobertura Obligatoria de Pruebas: Unitarias y BDD
**TODO desarrollo de código, algoritmo o componente debe incluir de manera estricta:**
1. **Pruebas Unitarias (Vitest + React Testing Library):** Archivos `*.test.ts` o `*.test.tsx` en `src/`.
2. **Pruebas BDD (Cucumber.js + Gherkin en español):** Archivos `features/*.feature` con sus respectivos `features/step_definitions/*.ts`.
3. Verificación mandatoria ejecutando `npm run test:all` antes de considerar una tarea completada.

### 5. Verificación Estricta de GitHub Actions en Despliegues Remotos
**REGLA MANDATORIA DE DESPLIEGUE:**
Siempre que se realice un `git push` de commits al repositorio remoto:
1. El agente o desarrollador **DEBE** monitorear y auditar activamente la ejecución de los GitHub Actions resultantes mediante la CLI (`gh run list`, `gh run view`).
2. Todos los jobs del workflow (instalación de dependencias, linting, tests unitarios con Vitest, escenarios BDD con Cucumber, compilación Next.js Turbopack y despliegue a Cloudflare Pages) **DEBEN completarse en estado exitoso (100% verde / `success`)**.
3. **Queda ESTRICTAMENTE PROHIBIDO** indicar que se ha terminado una actividad o declarar completada una tarea si los GitHub Actions están fallando o no han concluido exitosamente.

### 6. Respaldo Mandatorio de Credenciales y API Keys en el Archivo .env
**REGLA GENERAL DE GESTIÓN DE SECRETOS Y CREDENCIALES:**
Todas las credenciales, Client IDs, Client Secrets, tokens de acceso y API Keys que se generen, configuren o requieran en el proyecto (Cloudflare, Supabase, Google Cloud OAuth 2.0, servicios externos, etc.) **DEBEN respaldarse de manera inmediata y obligatoria en el archivo `.env` local**:
1. **Disponibilidad y Respaldo:** El archivo `.env` sirve como fuente de verdad local para desarrollo y respaldo operativo ante incidentes.
2. **Protección Estricta en Git:** El archivo `.env` **NUNCA** debe versionarse ni exponerse en el repositorio de Git (garantizado mediante `.gitignore`).
3. **Sincronización de Plantilla:** Cada nueva variable incorporada a `.env` debe reflejarse como plantilla de referencia (placeholder) en `.env.example` para guiar la configuración de entornos y GitHub Actions Secrets.

### 7. Sincronización Mandatoria de la Página 'Acerca de' (`/about`) ante Cambios en TODO o ROADMAP
**REGLA DE TRANSPARENCIA Y SINCRONIZACIÓN DE HOJA DE RUTA:**
Siempre que se actualice, modifique, complete o agregue cualquier tarea pendiente (**TODO**), hito funcional o plan estratégico (**ROADMAP**) en el repositorio (incluyendo documentos en `wiki/roadmap/`, issues o planes de versión):
1. **Modificación Inmediata de `/about`:** El agente o desarrollador **DEBE modificar y actualizar la página pública de "Acerca de" (`src/app/about/page.tsx`)**, reflejando con exactitud los hitos completados y los futuros pasos planificados.
2. **Coherencia con el LLM Wiki:** Las secciones de estado del proyecto y próximos lanzamientos de `/about` deben mantenerse en estricta sincronía con los documentos en `wiki/roadmap/` (`product_evolution.md`, `activity_plan.md`, `evolution_v2_plan.md`, `next_steps_plan.md`).
3. **Validación en Suite de Pruebas:** Toda modificación en la página `/about` debe mantener el 100% de éxito en sus pruebas unitarias (`src/app/about/page.test.tsx`) y escenarios BDD (`features/about_page.feature`).

---

## 📌 Concepto Clínico y de Producto
- **Nombre:** Cadensa (Inspirado en la cadencia del habla).
- **Lema:** *"Encuentra el ritmo de tu voz."*
- **Técnica:** Habla Rítmica Silábica (*Syllable-Timed Speech - STS*), método terapéutico que utiliza pulsos rítmicos regulares para eludir el déficit temporal de los ganglios basales en personas con tartamudez. Ver [`wiki/concepts/syllable_timed_speech.md`](wiki/concepts/syllable_timed_speech.md).
- **Metáfora:** La experiencia de gamificación y hábito diario estilo Duolingo, aplicada a la fluidez y seguridad comunicativa.

---

## 🏗️ Arquitectura y Restricciones Técnicas
- **Frontend:** Next.js 16 (App Router) en modo exportación estática obligatoria (`output: 'export'`). Todos los componentes interactivos deben llevar la directiva `'use client'`. Ver [`wiki/architecture/frontend.md`](wiki/architecture/frontend.md).
- **Backend:** Supabase PostgreSQL con **Zero Trust RLS**. Jamás expongas `service_role` en el frontend; toda seguridad se valida con políticas RLS a través de `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Ver [`wiki/concepts/zero_trust_rls.md`](wiki/concepts/zero_trust_rls.md).
- **Contenedores:** Dockerfile multi-stage (`node:20-slim` para build + `nginx:alpine` para runtime SPA estático). Ver [`wiki/architecture/containerization.md`](wiki/architecture/containerization.md).
- **Estilos:** Tailwind CSS v4 con dark mode profundo (`bg-zinc-950`) y acentos en esmeralda/cian (`from-emerald-400 to-cyan-400`).
