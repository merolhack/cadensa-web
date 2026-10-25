# Cadensa LLM Wiki — Schema & Governance

> **Basado en la especificación LLM Wiki de Andrej Karpathy**  
> Referencia: [gist.github.com/karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

Este documento define la estructura, convenciones operativas y flujos de mantenimiento del **LLM Wiki de Cadensa**. Cualquier agente de IA (Claude Code, OpenAI Codex, Antigravity, etc.) o desarrollador humano que trabaje en este repositorio debe seguir estas reglas.

---

## 1. Filosofía Central

Un **LLM Wiki** es un artefacto persistente y acumulativo que se sitúa entre el código fuente/documentos crudos y los usuarios/agentes. A diferencia de un sistema RAG tradicional que redescubre fragmentos en cada consulta, el wiki compila el conocimiento de forma modular, mantiene referencias cruzadas bidireccionales, detecta contradicciones y se mantiene actualizado con cada cambio o ingesta.

**Regla de autoría:**
- El **humano** explora, cursa fuentes, toma decisiones de producto y formula preguntas.
- El **LLM** escribe, interconecta, resume, cataloga y mantiene la consistencia de todos los archivos del wiki.

---

## 2. Las Tres Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FUENTES CRUDAS (wiki/raw/)                               │
│ Documentos de base, papers clínicos, notas de producto.     │
│ Inmutables — el LLM lee pero no los altera.                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ingesta / Extracción
┌──────────────────────────────▼──────────────────────────────┐
│ 2. EL WIKI (wiki/ - modular)                                │
│ Archivos Markdown interconectados: arquitectura, conceptos, │
│ entidades, síntesis, roadmap. Propiedad del LLM.            │
└──────────────────────────────▲──────────────────────────────┘
                               │ Instrucciones de operación
┌──────────────────────────────┴──────────────────────────────┐
│ 3. EL ESQUEMA (wiki/SCHEMA.md & AGENTS.md)                  │
│ Reglas de formato, ciclo de vida, indexación y bitácora.    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura de Directorios

```
wiki/
├── SCHEMA.md                 # Este archivo: reglas de gobierno para LLMs
├── index.md                  # Catálogo de navegación y sumario rápido
├── log.md                    # Bitácora cronológica append-only
├── raw/                      # Capa 1: Fuentes crudas e inmutables
│   ├── clinical_foundations.md
│   └── poc_specifications.md
├── architecture/             # Capa 2: Decisiones y diseño de ingeniería
│   ├── overview.md
│   ├── frontend.md
│   ├── backend_database.md
│   └── cicd_deployment.md
├── concepts/                 # Capa 2: Dominio funcional y patrones
│   ├── syllable_timed_speech.md
│   ├── zero_trust_rls.md
│   └── static_spa_paradigm.md
├── entities/                 # Capa 2: Componentes, tablas y servicios
│   ├── supabase.md
│   ├── cloudflare_pages.md
│   └── profiles_table.md
└── roadmap/                  # Capa 2: Evolución de producto y planes
    └── product_evolution.md
```

---

## 4. Convenciones de Archivo y Frontmatter

Cada archivo dentro del wiki (excepto `SCHEMA.md`, `index.md` y `log.md`) debe comenzar con metadatos YAML estandarizados:

```yaml
---
title: "Título del documento"
category: "architecture | concepts | entities | roadmap | raw"
tags: [tag1, tag2, tag3]
last_updated: "YYYY-MM-DD"
sources:
  - "wiki/raw/nombre_fuente.md"
related:
  - "wiki/architecture/otro_doc.md"
---
```

### Reglas de Formato:
1. **Enlaces bidireccionales:** Usar enlaces relativos de markdown estándar (compatibles con Obsidian y lectores Git): `[Nombre](relative/path.md)`.
2. **Cero LaTeX/MathJax:** Prohibido el uso de `$`, `$$`, o comandos TeX. Usar símbolos Unicode (`→`, `←`, `≤`, `≥`, `×`, `✓`) y emojis semánticos.
3. **Brevedad y modularidad:** Ningún archivo debe intentar explicar todo el proyecto. Si un tema supera 150-200 líneas de detalle técnico, fragmentarlo en una nueva entidad o concepto e interconectarlo.

---

## 5. Operaciones Estándar del LLM

### Operación 1: Ingest (Ingesta de nuevas fuentes)
Cuando el usuario proporciona un nuevo documento, paper o nota en `wiki/raw/`:
1. El LLM lee el documento crudo a profundidad.
2. Extrae entidades clave, conceptos técnicos o decisiones clínicas.
3. Actualiza o crea las páginas correspondientes en `wiki/concepts/`, `wiki/entities/` o `wiki/architecture/`.
4. Actualiza `wiki/index.md` con las nuevas páginas o descripciones modificadas.
5. Agrega una entrada a `wiki/log.md` con el formato estándar.

### Operación 2: Query (Consultas y síntesis)
Cuando el usuario pregunta sobre la arquitectura o lógica de negocio:
1. El LLM consulta primero `wiki/index.md` para identificar los nodos relevantes.
2. Lee los archivos específicos necesarios y sintetiza la respuesta citando las páginas del wiki.
3. **Compounding:** Si la respuesta contiene un análisis valioso, comparación técnica o diseño que deba persistir, el LLM ofrece o procede a guardarlo como una nueva página en el wiki (por ejemplo en `wiki/concepts/` o `wiki/architecture/`).

### Operación 3: Lint (Auditoría de consistencia)
Periódicamente o a petición del usuario:
1. Verificar si existen **páginas huérfanas** (sin enlaces entrantes desde `index.md` u otros documentos).
2. Detectar **afirmaciones obsoletas** o contradicciones entre versiones (ej. cambios en el schema de Supabase o dependencias de Next.js).
3. Identificar términos o componentes mencionados repetidamente que carezcan de su propia página de entidad.
4. Registrar el resultado del lint en `wiki/log.md`.

---

## 6. Formato de la Bitácora (`log.md`)

Cada evento debe ser registrado de forma append-only con una cabecera parseable por herramientas UNIX:

```markdown
## [YYYY-MM-DD] <operación> | <resumen corto>
- **Detalle**: Breve explicación de lo realizado.
- **Archivos creados/modificados**: Lista de rutas tocadas.
- **Autor**: LLM (Modelo) / Humano.
```

Ejemplo de búsqueda rápida en terminal:
```bash
grep "^## \[" wiki/log.md | tail -5
```

---

## 7. Herramientas Obligatorias del Entorno de Desarrollo

1. **Codebase Memory MCP (`codebase-memory`):**
   - **Proyecto:** `home-merolhack-fl-cadensa-web`
   - **Ruta:** `/home/merolhack/fl/cadensa-web`
   - **Protocolo:** Utilizar siempre las herramientas de grafo (`search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, `get_architecture`) para navegar y comprender el código antes de realizar búsquedas textuales ciegas.
2. **Modelos Secundarios (`ollama-local`):**
   - Delegar tareas mecánicas o repetitivas (generación de fixtures, docstrings, formateo de datos) a `consultar_modelo_local` (1. `gemma4:cloud`, 2. `qwen3:8b-8k`).
3. **Validación Continua de Calidad (Unitarias + BDD):**
   - Cualquier componente, módulo o función desarrollada debe tener cobertura de pruebas unitarias (`*.test.ts`, `*.test.tsx`) y escenarios BDD en Gherkin (`features/*.feature` con sus step definitions en TypeScript). Ver [wiki/architecture/testing.md](architecture/testing.md).
4. **Sincronización Mandatoria de la Página 'Acerca de' (`/about`):**
   - Cualquier cambio, avance, completitud o incorporación en el **ROADMAP** o **TODO** (documentos en `wiki/roadmap/`) exige la actualización inmediata de la página pública `src/app/about/page.tsx` para mantener transparencia con la comunidad y fonoaudiólogos. Ver [wiki/architecture/about_and_roadmap_sync.md](architecture/about_and_roadmap_sync.md).


