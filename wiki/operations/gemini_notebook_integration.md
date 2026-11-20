---
title: Integración con Gemini Notebook (NotebookLM MCP)
category: operations
tags: [notebooklm, gemini-notebook, mcp, llm-wiki, karpathy, sync]
updated: 2026-11-19
---

# Integración Bidireccional con Gemini Notebook (`notebooklm-mcp`)

Este documento establece el estándar operativo para conectar la LLM Wiki local de **Cadensa** (`wiki/` y `AGENTS.md`) con el cuaderno oficial de **Gemini Notebook** a través del servidor MCP `@arlinamid/notebooklm-mcp`.

---

## 1. Identificadores Canónicos

- **Nombre del Cuaderno:** `Cadensa: Fluidez y Terapia del Habla`
- **Notebook ID (UUID):** `015dcad0-c2a3-4512-97eb-59ac4293d8c0`
- **Library ID en `notebooklm-mcp`:** `cadensa-fluidez-y-terapia-del`
- **URL Canónica:** https://notebook.google.com/notebook/015dcad0-c2a3-4512-97eb-59ac4293d8c0
- **Fuente Maestra Consolidada:** `CADENSA-LLM-WIKI-KARPATHY-MASTER.md`
- **Estado Local de Sincronización:** `.git/cadensa-wiki-sync-state.json` (no versionado en Git)

---

## 2. Flujo de Sincronización Automática

Para mantener sincronizada la base de conocimiento local (arquitectura Karpathy de 3 capas) con Gemini Notebook, utiliza los scripts NPM configurados en `package.json`:

```bash
# Sincronización completa (compila wiki/, sube fuente maestra y limpia snapshots previos)
npm run wiki:sync-notebook

# Sincronización condicional (solo sube si cambió el hash SHA-256 de la wiki)
npm run wiki:sync-notebook:if-changed

# Validación local sin llamadas remotas (dry-run)
node scripts/sync-wiki-to-notebook.mjs --dry-run

# Sincronizar y consultar al cuaderno en un solo paso
node scripts/sync-wiki-to-notebook.mjs --ask="¿Cuál es el estado actual de la arquitectura de Cadensa?"

# Purga de emergencia para fuentes en estado failed (vía RPC tGMBJ en lotes)
npm run notebook:purge
```

### ¿Qué compila `scripts/sync-wiki-to-notebook.mjs`?
1. Reglas raíz: `AGENTS.md`.
2. Gobernanza e índice: `wiki/SCHEMA.md`, `wiki/index.md`.
3. Todas las páginas modulares ordenadas alfabéticamente de:
   - `wiki/architecture/*.md`
   - `wiki/concepts/*.md`
   - `wiki/entities/*.md`
   - `wiki/operations/*.md`
   - `wiki/roadmap/*.md`
4. Las 150 líneas más recientes de `wiki/log.md` (bitácora append-only).

Al subir la nueva versión de `CADENSA-LLM-WIKI-KARPATHY-MASTER.md`, el script elimina automáticamente versiones anteriores de sí mismo y el resumen estático legado (`CADENSA_MASTER_SUMMARY.md`) para evitar duplicidad de contexto.

---

## 3. Reglas de Seguridad y Prevención de Contaminación

1. **Regla de Tipo Estricto (`type: "text"`):**
   Queda estrictamente **PROHIBIDO** invocar la herramienta MCP `add_source` omitiendo el parámetro `"type": "text"` al subir texto o Markdown. La omisión de `type` provoca que `@arlinamid/notebooklm-mcp` divida el texto por espacios en blanco (`split(/\s+/)`) y envíe cada palabra como una URL individual a Google, contaminando el cuaderno con cientos de fuentes en estado `failed`.
2. **Centralización vía Compilador:**
   Toda sincronización de documentación del repositorio debe canalizarse a través de `scripts/sync-wiki-to-notebook.mjs` o invocando `add_source` con `"type": "text"` explícito.
3. **Saneamiento Rápido vía RPC `tGMBJ`:**
   Ante cualquier fuente corrupta o en estado `failed`, ejecutar `npm run notebook:purge` (`scripts/purge-failed-notebook-sources.mjs`), que despacha eliminaciones atómicas por lotes de 40 fuentes.

---

## 4. Auditoría Inicial de Saneamiento (2026-11-19)

Al integrar el cuaderno `015dcad0-c2a3-4512-97eb-59ac4293d8c0`, se auditaron las **301 fuentes** existentes y se ejecutó una purga selectiva de **94 fuentes** de nulo valor o redundantes:

- **27 fuentes bloqueadas / vacías (error de rastreo):** Páginas de PubMed/PMC bloqueadas por reCAPTCHA (49–56 palabras), ResearchGate Error 1020 (65 palabras), CloudFront 403 en Stroke Association (71 palabras), error de navegador en UQ eSpace (28 palabras) y stub de 18 palabras.
- **13 duplicados exactos o ediciones obsoletas:** URLs repetidas (ASHA Practice Portal, STAMMA, Koray Ulusan DAF, Stamurai CBT, RESTART-DCM, Stuttering Foundation, boletín IMSS), duplicados de Palasik & Hannan 2013 (PDF repetido + abstracto + ficha UAkron), y guías clínicas antiguas reemplazadas por sus versiones vigentes (Camperdown 2018 -> 2024 v4.0; Lidcombe 2017 -> 2025 v1.7b).
- **53 fuentes fuera de dominio o ruido comercial:** Vacantes laborales de SLP (`Presence`, `Huddle Up`), licencias estatales de Texas, apps no relacionadas con tartamudez (`Fluency` aprendizaje de idiomas, `usefluency.com` ad-tech, `MyFluent` hipotecas UK, `ELSA Speak`, apps de afasia post-ictus), artículos de gamificación fintech/fitness/marketing, efemérides jurídicas SCJN, trastornos temporomandibulares, Tourette y comunicados corporativos M&A.
- **1 resumen legado (`CADENSA_MASTER_SUMMARY.md`):** Reemplazado por la sincronización viva `CADENSA-LLM-WIKI-KARPATHY-MASTER.md`.

Se conservaron íntegras todas las fuentes clínicas relevantes sobre tartamudez, terapias basadas en evidencia (STS, DAF/FAF, Camperdown, Lidcombe, RESTART-DCM, ACT, CBT, Van Riper), reportes de Deep Research, literatura en español/México y las notas propias de Cadensa.
