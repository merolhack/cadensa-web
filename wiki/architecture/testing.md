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

---

## 3. Pruebas Automatizadas de Procesamiento de Audio y Video (`tests/python/`)

- **Framework:** `pytest` + `pytest-mock` en el entorno ComfyUI Standalone (`standalone-env`).
- **Librerías de Procesamiento:** `opencv-python`, `numpy`, `wave`, `ffprobe` (vía `subprocess`).
- **Módulos Cubiertos:**
  - `tests/python/test_audio_generation.py`: Validación de duración fonoaudiológica (±0.05s a 60 BPM), silencio fisiológico preparatorio (RMS < 1.0 en primeros 2.5s), estructura de `timeline.json` y mapeo fonético IPA.
  - `tests/python/test_video_composition.py`: Verificación de metadatos Full HD (1920×1080 a 25 FPS), color de fondo `#0F0F13` (BGR nominal 19, 15, 15), nitidez visual mediante varianza del operador Laplaciano (`> 50.0`) y pulso esmeralda (`#10b981`) del metrónomo en `t = 3.5s`.
  - `tests/python/test_pipeline_integration.py`: Integración rápida de punta a punta con video de prueba de 3 segundos, validando multiplexación H.264/AAC y orquestación con mock de ComfyUI.

```bash
# Ejecutar suite de pruebas de procesamiento de video y audio
npm run test:python

# O directamente con el intérprete Python Standalone
powershell -Command "& 'C:\Users\lenin\AppData\Local\Comfy-Desktop\ComfyUI-Installs\ComfyUI\standalone-env\python.exe' -m pytest tests/python -v"
```


---

## 4. Pruebas de Accesibilidad (a11y) con axe-core y vitest-axe (`src/components/accessibility.test.tsx`)

- **Framework:** `axe-core` + `vitest-axe` integrado con React Testing Library y Vitest.
- **Estándar Objetivo:** WCAG 2.1 Nivel AA / AAA (Sección 508 y directrices de software médico fonoaudiológico).
- **Alcance Auditado Automatizado:**
  - `TechniqueVideoModal.tsx`: Verificación de ausencia total de violaciones de accesibilidad tanto en estado de póster interactivo como con video montado; verificación de trampa de foco (Focus Trap) ciclando `Tab` / `Shift+Tab` dentro del diálogo y restauración automática del elemento previo activo al cerrar; cierre con tecla `Escape`.
  - `TechniquesCatalogHome.tsx`: Auditoría de elementos accionables de navegación fonoaudiológica con roles semánticos (`role="button"`), soporte completo de teclado (`Enter` / `Espacio`), etiquetas accesibles descriptivas (`aria-label`) y foco visible con alto contraste.
  - `src/app/page.tsx` (Home Principal): Jerarquía estructural estricta de encabezados (`h1` → `h2` → `h3`) sin saltos de nivel (`heading-order`), etiquetas obligatorias para controles de formulario y deslizadores de BPM (`label`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`).

```bash
# Ejecutar suite especializada de accesibilidad WCAG AA
npm test -- src/components/accessibility.test.tsx
```

---

## 5. Estado de Certificación y Cobertura (Prueba de Fuego Clean Room & A11y)

El sistema cuenta con una cobertura integral automatizada validada en un entorno limpio sin fallos ni omisiones:

| Suite de Pruebas | Entorno / Motor | Total Tests / Escenarios | Estado | Tiempo de Ejecución |
| :--- | :--- | :--- | :--- | :--- |
| **Pruebas Python Multimedia** | `pytest 9.2` (ComfyUI Standalone) | 30 tests (0 xfail, 0 skip) | ✅ 100% PASSED | ~31.2s |
| **Pruebas Unitarias Frontend** | `vitest 4.1` (JSDOM + RTL) | 313 tests (69 suites) | ✅ 100% PASSED | ~5.9s |
| **Pruebas Accesibilidad (a11y)** | `axe-core` + `vitest-axe` (WCAG AA) | 4 suites principales (0 violaciones) | ✅ 100% PASSED | ~1.8s |
| **Pruebas BDD Clínicas** | `@cucumber/cucumber 11` (TSX) | 104 escenarios (403 pasos) | ✅ 100% PASSED | ~2.5s |
| **Compilación Estática Next.js** | Turbopack 16.4 | 18 rutas estáticas generadas | ✅ 100% SUCCESS | ~1.7s |

### Criterios Fonoaudiológicos Auditados en Pruebas:
1. **Fidelidad y Reposo Orofacial:** Medición de landmarks labiales iBUG 60-67 normalizados contra ancho de comisuras (48-54) y cavidad intraoral oscura (`gray < 45`), certificando un reposo labial cerrado del 98% en respiración diafragmática.
2. **Lip-Sync Error Objetivo (SyncNet):** LSE-D ≤ 11.0 y LSE-C ≥ 0.25 para las 7 técnicas fonoaudiológicas sin dependencias cruzadas de audio.
3. **Calidad de Audio EBU R128:** Medición estricta de sonoridad en dos pasadas (-16 LUFS, True Peak -1.5 dBFS) y frecuencia de muestreo a 48 kHz.
4. **Optimización de Transferencia Web:** Portadas en WebP con compresión de alta calidad (calidad 85, método 6) que reducen el payload de imágenes en un -93%.
