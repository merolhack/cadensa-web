# Cadensa

**Encuentra el ritmo de tu voz. (Find the rhythm of your voice)**

Una plataforma diaria que entrena tu ritmo al hablar para superar bloqueos y comunicarte con total seguridad.

---

## 🔬 Concepto Clínico
Cadensa se basa en el **ritmo** y el **habla rítmica silábica** (*syllable-timed speech*), una técnica clínica comprobada para reducir la tartamudez enseñando al usuario a hablar con una cadencia temporal constante.

Cadensa es un nombre de marca inspirado en la palabra "cadencia": el ritmo, la velocidad y la regularidad con la que se producen sonidos, palabras o movimientos.

---

## 💻 Stack Tecnológico
- **Front-end**: Next.js 16 (App Router, Client Components, Tailwind CSS v4, TypeScript 5).
- **Back-end & Seguridad**: Supabase (PostgreSQL 15+, Row Level Security - Zero Trust).
- **Pruebas**: Vitest 4 (Unitarias) + Cucumber.js con Gherkin en español (BDD).
- **Contenedores**: Docker multi-stage (`node:20-slim` + `nginx:alpine`).
- **Despliegue & Edge**: Cloudflare Pages vía GitHub Actions CI/CD.

---

## 📚 Base de Conocimiento y Gobernanza (LLM Wiki)
Este repositorio mantiene un **LLM Wiki modular** siguiendo las especificaciones de [Andrej Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
- **[wiki/index.md](wiki/index.md)**: Catálogo global e índice clasificado de arquitectura, conceptos clínicos y entidades.
- **[wiki/SCHEMA.md](wiki/SCHEMA.md)**: Protocolo de operaciones (*Ingest*, *Query*, *Lint*) y reglas de gobierno.
- **[wiki/log.md](wiki/log.md)**: Bitácora cronológica append-only de modificaciones.

---

## 🤖 Directrices para Agentes de IA
Cualquier asistente de IA que opere en este repositorio debe respetar lo estipulado en **[AGENTS.md](AGENTS.md)**:
1. **Codebase Memory (`codebase-memory`)**: Proyecto `home-merolhack-fl-cadensa-web` (`/home/merolhack/fl/cadensa-web`). Uso prioritario de herramientas de grafo sobre búsqueda textual ciega.
2. **Modelos Secundarios (`ollama-local`)**: Delegación de tareas mecánicas/rutinarias a `consultar_modelo_local` (`gemma4:cloud` → `qwen3:8b-8k`).
3. **LLM Wiki Modular**: Prohibición de documentos monolíticos; mantener la estructura en `wiki/`.
4. **Pruebas Obligatorias**: Todo cambio de lógica o funcionalidad debe acompañarse de pruebas unitarias y escenarios BDD (`npm run test:all`).

---

## 🚀 Comandos Rápidos

```bash
# Desarrollo local
npm run dev

# Ejecutar pruebas completas (Unitarias + BDD)
npm run test:all

# Construir y levantar con Docker
docker build -t cadensa-web:latest .
docker run -p 3000:80 cadensa-web:latest
```
