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

### 8. Protocolo de Ejecución Desatendida Zero-Hang y Prevención de Bloqueos
**REGLA MANDATORIA DE FIABILIDAD EN PROCESOS DESATENDIDOS:**
Queda terminantemente PROHIBIDO lanzar tareas en segundo plano o procesos desatendidos que puedan requerir interacción por teclado, `sudo`, confirmaciones interactivas (`[y/N]`, `npx` prompts) o que carezcan de un límite estricto de tiempo (*timeout* defensivo).
1. **Prohibición Absoluta de `sudo`:** Nunca invocar `sudo` en scripts, comandos o subprocesos de IA. En contenedores, utilizar `-u 0` dentro del contenedor si se requieren permisos elevados.
2. **Timeouts Defensivos Obligatorios:** Todo comando en segundo plano susceptible de demorarse debe envolverse en `timeout --kill-after=10s <segundos> <comando>`.
3. **Desacople de Entrada Estándar y Banderas No-Interactivas:** Cerrar siempre `stdin` (`< /dev/null`) y activar banderas no interactivas (`-y`, `--yes`, `-nostdin`, `DEBIAN_FRONTEND=noninteractive`, `GIT_TERMINAL_PROMPT=0`).
4. **Heartbeat Watchdog y Checkpoints en Disco:** Tareas pesadas (>3 min, ej. generación audiovisual en ComfyUI/Wav2Lip o ingestas) deben emitir latidos periódicos y registrar puntos de control en `reports/.unattended_status.json` para permitir reanudación limpia ante interrupciones.
5. **Circuit Breakers ante Servicios Externos:** Máximo 3 reintentos con retroceso exponencial (*exponential backoff* con jitter) ante fallos en APIs externas (Supabase, Google Search Console, ComfyUI local).
Ver [`wiki/operations/zero_hang_unattended_protocol.md`](wiki/operations/zero_hang_unattended_protocol.md).

### 9. Limpieza Estricta y Obligatoria de Contenedores Docker (Zero-Dangling Containers)
**REGLA MANDATORIA DE GESTIÓN Y LIMPIEZA DE CONTENEDORES:**
Queda terminantemente PROHIBIDO dejar contenedores Docker (`cadensa-web`, stacks locales de Supabase, imágenes temporales o servicios auxiliares) en ejecución en segundo plano tras concluir pruebas locales, validaciones o cuando no se estén utilizando activamente:
1. **Apagado Inmediato Post-Pruebas:** Siempre que se levante un contenedor Docker o stack compose para ejecutar pruebas (unitarias, BDD, E2E), migraciones o comprobaciones locales, el agente o desarrollador **DEBE detenerlo y removerlo inmediatamente al finalizar** la tarea (ej. `docker compose down -v`, `docker stop $(docker ps -q --filter "name=cadensa-web")`, o `supabase stop`).
2. **Verificación Previa a Concluir Turno:** Antes de dar por finalizada cualquier actividad o entregar una respuesta, el agente debe verificar activamente el estado de los contenedores mediante `docker ps`. Si detecta contenedores huérfanos o en ejecución asociados al proyecto (`com.docker.compose.project=cadensa-web` o nombre `cadensa-web`), **DEBE apagarlos de inmediato** para evitar el desperdicio continuo de memoria RAM (1.8+ GB) y consumo residual de CPU en el sistema anfitrión.
3. **Uso Defensivo en Scripts de Automatización:** Todo script o pipeline local que invoque Docker debe estructurarse con bloques de limpieza garantizada (`trap` en Bash o `try...finally` en Python/Node.js) para asegurar la detención forzosa de los contenedores incluso en caso de fallo, interrupción o timeout.
4. **Prohibición de Contenedores Zombi o Huérfanos:** No se deben dejar contenedores en estado `Up` desatendidos cuando no haya una prueba o sesión interactiva en curso que los requiera explícitamente.

### 10. Regla Estricta de Coherencia Visual, Arquitectura de Rejilla (Bootstrap Grid) y Accesibilidad en Nuevos Elementos
**REGLA MANDATORIA DE DISEÑO Y CONSISTENCIA GEOMÉTRICA:**
Siempre que se agreguen, modifiquen o amplíen componentes, tarjetas, vistas o elementos interactivos en la aplicación, **DEBEN cumplir obligatoriamente con los estándares canónicos de diseño, rejilla y accesibilidad ya establecidos**:
1. **Contenedor Maestro Canónico Unificado (`max-w-5xl = 1024px`):**
   Toda vista principal, pantalla completa, sección focal o pie de página debe respetar el ancho maestro `w-full max-w-5xl mx-auto`. Queda ESTRICTAMENTE PROHIBIDO introducir anchos arbitrarios desalineados (como `max-w-4xl`, `max-w-3xl`) que provoquen saltos visuales (*Cumulative Layout Shift - CLS > 0*) al alternar vistas. Modales y componentes de enfoque específico deben respetar su estándar correspondiente (`max-w-2xl` o `max-w-xl`).
2. **Columnas y Tarjetas de Altura Uniforme (*Equal Height Cards*):**
   Toda rejilla multi-columna (CSS Grid) debe implementar el patrón simétrico:
   - Contenedor de rejilla: `grid items-stretch gap-5` (o `gap-4`).
   - Tarjeta: `h-full flex flex-col justify-between`.
   - Zona de información: `flex-1 flex flex-col`.
   - Botonera/acciones finales ancladas al fondo: `mt-auto pt-3 border-t border-zinc-800/80 w-full flex items-center justify-between gap-2`.
   - **Prohibido:** Dejar botones flotando a diferentes alturas debido a títulos o textos descriptivos de longitud variable (*dangling buttons*).
3. **Relación de Aspecto Fija (*Fixed Aspect Ratio*):**
   Miniaturas y videos deben fijar `aspect-video` (16:9) con `object-cover`. Avatares, insignias y orbes deben fijar `aspect-square` (1:1).
4. **Accesibilidad Obligatoria WCAG 2.1 AA:**
   Todo nuevo control o botón debe tener un área táctil mínima (touch target ≥ 44×44 px o padding ergonómico), nombre accesible (`aria-label` o texto visible), contraste mínimo 4.5:1, y estados semánticos correctos (`aria-pressed` para alternancias fuera de tablist). Cero violaciones permitidas en auditorías con `axe-core`.
5. **Directiva Next.js Client-Side (`'use client'`):**
   Todo componente interactivo nuevo en `src/components/` debe incluir `'use client'` en su primera línea.
6. **Verificación Automatizada Mandatoria en Pruebas:**
   Toda nueva funcionalidad o elemento agregado debe ser cubierto y validado por:
   - Pruebas arquitectónicas en Vitest (`src/tests/design_system_consistency.test.ts`).
   - Escenarios BDD en Cucumber (`features/design_system_and_layout_consistency.feature`).
   - Pruebas E2E en Playwright (`tests/e2e/cadensa.spec.ts`).

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
