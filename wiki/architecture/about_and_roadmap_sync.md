---
title: "Página Acerca de y Sincronización Mandatoria de Hoja de Ruta"
category: "architecture"
tags: [architecture, about, roadmap, todo, governance, author]
last_updated: "2026-10-25"
sources:
  - "wiki/roadmap/product_evolution.md"
  - "wiki/roadmap/activity_plan.md"
  - "wiki/roadmap/evolution_v2_plan.md"
  - "wiki/roadmap/next_steps_plan.md"
related:
  - "wiki/SCHEMA.md"
  - "wiki/index.md"
  - "wiki/architecture/overview.md"
---

# Página Acerca de (`/about`) y Protocolo de Sincronización de Hoja de Ruta

Este documento define la arquitectura, propósito y protocolo operativo de la página pública **Acerca de (`src/app/about/page.tsx`)** de Cadensa.

---

## 1. Propósito y Alcance de la Página `/about`

La página `/about` sirve como el manifiesto público, técnico y clínico de Cadensa, estructurada en cuatro componentes fundamentales:

1. **Propósito Clínico y Base Neurobiológica:**
   - Explicación accesible del método **Habla Rítmica Silábica (*Syllable-Timed Speech - STS*)**.
   - Justificación del marcapasos isocrónico externo para eludir el déficit temporal de los ganglios basales.
   - Enfoque de gamificación y micro-hábitos terapéuticos de 5 minutos diarios.
   - Principios de privacidad Zero Trust: procesamiento de audio en cliente con Web Audio API sin almacenamiento central de grabaciones vocales.

2. **Estado del Proyecto y Futuros Pasos (ROADMAP & TODO en vivo):**
   - Hitos consolidados y operativos en producción (v2.0).
   - Futuros pasos en desarrollo activo (diadococinesia oral, reportes fonoaudiológicos para terapeutas, Audio Worklet, simulaciones de situaciones reales y PWA nativa).

3. **Referencia y Liderazgo Técnico del Autor:**
   - Perfil profesional del arquitecto y creador del proyecto: **Lenin Meza**.
   - Enlace oficial al sitio web y portafolio en GitHub Pages: [`https://merolhack.github.io`](https://merolhack.github.io).
   - Enlace al perfil profesional en LinkedIn: [`http://www.linkedin.com/in/leninmezazarco`](http://www.linkedin.com/in/leninmezazarco).
   - Enlace al repositorio y perfil de GitHub: [`https://github.com/merolhack`](https://github.com/merolhack).
   - Referencia editorial a su libro *"Playbook de Arquitectura MACH"* (Amazon KDP 2026, ASIN: B0HFYGC34D).

4. **Vinculación Comunitaria y Código Abierto:**
   - Enlace a la Asociación Mexicana de la Tartamudez (AMTTM) e invitación a la contribución colaborativa.

---

## 2. Regla Operativa de Sincronización Mandatoria

> **REGLA DE ORO DE GOBERNANZA:**  
> Siempre que se modifique, actualice, agregue o complete un ítem en los documentos de planificación de `wiki/roadmap/` (`product_evolution.md`, `activity_plan.md`, `evolution_v2_plan.md`, `next_steps_plan.md`), issues de GitHub o backlogs de tareas pendientes (**TODO**), **es obligatorio actualizar concurrentemente la página `src/app/about/page.tsx`**.

### Protocolo de Actualización:
1. **Actualizar el documento en `wiki/roadmap/`**: Describir el avance o cambio de prioridad.
2. **Reflejar el cambio en `src/app/about/page.tsx`**:
   - Si un hito se completó: Moverlo de "Futuros Pasos" a "Hitos Completados y Operativos" con su viñeta descriptiva.
   - Si se planificó un nuevo paso: Agregarlo en "Futuros Pasos en Desarrollo Activo".
3. **Validación Automatizada**:
   - Ejecutar la suite unitaria: `npx vitest run src/app/about/page.test.tsx`.
   - Ejecutar la suite BDD: `npm run test:bdd` validando `features/about_page.feature`.
   - Compilación estática: Verificar con `npm run build` que la ruta `/about` se pre-renderice limpiamente.
4. **Registro en Bitácora**: Asentar el cambio cronológico en `wiki/log.md`.
