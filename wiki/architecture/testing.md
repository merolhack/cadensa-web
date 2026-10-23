---
title: "Estrategia de Pruebas: Unitarias (Vitest) y BDD (Cucumber)"
category: "architecture"
tags: [testing, vitest, cucumber, bdd, react-testing-library]
last_updated: "2026-10-23"
sources:
  - "vitest.config.mts"
  - "cucumber.json"
  - "features/"
  - "src/lib/rhythm.test.ts"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/architecture/frontend.md"
---

# Estrategia de Pruebas: Unitarias y BDD

Cadensa implementa una pirámide de pruebas que combina **pruebas unitarias** rápidas a nivel de lógica/componente y **pruebas BDD (Behavior-Driven Development)** orientadas al comportamiento clínico de la plataforma.

---

## 1. Pruebas Unitarias con Vitest

- **Framework:** `vitest` v4 + `@testing-library/react` + `jsdom`.
- **Configuración:** `vitest.config.mts` con alias `@/*` apuntando a `./src/*`.
- **Alcance:**
  - `src/lib/rhythm.test.ts`: Pruebas de cálculo de tempo isocrónico (BPM a milisegundos, secuencias silábicas y rangos clínicos).
  - `src/app/page.test.tsx`: Aserción de renderizado accesible y marcas de identidad del PoC.

```bash
# Ejecutar suite de pruebas unitarias
npm test

# Modo observador (watch mode)
npm run test:watch
```

---

## 2. Pruebas BDD con Cucumber y Gherkin

- **Herramienta:** `@cucumber/cucumber` + `tsx` (ejecución directa de TypeScript sin transpilación previa).
- **Idioma Gherkin:** Español (`# language: es`).
- **Ubicación:** `features/*.feature` y `features/step_definitions/*.ts`.
- **Casos Implementados:**
  - `features/rhythm_pacing.feature`: Verificación del protocolo de Habla Rítmica Silábica (STS), duraciones y límites BPM recomendados.
  - `features/onboarding_navigation.feature`: Comportamiento de la interfaz de onboarding y coherencia de lemas terapéuticos.

```bash
# Ejecutar escenarios BDD
npm run test:bdd

# Ejecutar toda la suite completa (Unitarias + BDD)
npm run test:all
```
