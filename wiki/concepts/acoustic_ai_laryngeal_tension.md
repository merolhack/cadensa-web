---
title: "Inferencia Acústica On-Device de Micro-Tensión Laríngea y Calibración Dialectal"
category: "concepts"
tags: [clinical, acoustic-ai, laryngeal-tension, webgpu, dialect-presets, zero-trust]
last_updated: "2026-10-30"
sources:
  - "src/lib/acousticAiDetector.ts"
  - "src/components/AcousticBiofeedback.tsx"
  - "src/lib/phoneticPresets.ts"
  - "src/components/DialectSelector.tsx"
  - "src/components/Footer.tsx"
related:
  - "wiki/concepts/acoustic_block_detection.md"
  - "wiki/concepts/easy_onset.md"
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/roadmap/platform_telemetry_and_seo_plan.md"
---

# Inferencia Acústica On-Device de Micro-Tensión Laríngea y Calibración Dialectal

## 1. Fundamentación Fonoaudiológica y Neurobiológica

En personas con tartamudez (disfemia persistente del desarrollo), el 80% de los bloqueos articulatorios e interrupciones del flujo verbal se originan antes de que el sonido sea audible (fase pre-fonatoria). Este fenómeno clínico se conoce como **hiperaducción laríngea espasmódica** o rigidez subglótica anticipatoria.

El paciente, al prever una palabra temida, activa de forma involuntaria los músculos cricoaritenoideos laterales y tiroaritenoideos con una fuerza desproporcionada, impidiendo la vibración libre de las cuerdas vocales (pliegues vocales) y generando un bloqueo tónico.

### Objetivos de la Inferencia On-Device:
1. **Detección Precoz:** Evaluar la tasa de cambio espectral (Spectral Flux), la irregularidad micro-temporal (Jitter) y el ratio de alta frecuencia (High-Frequency Ratio) durante el inicio de la fonación.
2. **Biofeedback Inmediato:** Alertar al paciente mediante una escala visual continua de tensión (0% a 100%) con niveles de riesgo:
   - **Bajo (0% a 34%):** Fonación suave y relajada.
   - **Moderado (35% a 64%):** Tensión creciente, recomendando activación de Inicio Suave (Easy Onset).
   - **Alto (65% a 100%):** Hiperaducción inminente, sugiriendo pausa consciente de 3 segundos y respiración diafragmática 4-4-4-4.
3. **Privacidad Estricta Zero Trust:** El 100% de los cálculos espectrales y tensores se ejecutan en el hilo local del navegador mediante Web Audio API / WebGPU sin transmitir muestras de voz a ningún servidor externo.

---

## 2. Arquitectura de Calibración Fonética Dialectal

El español no posee un ritmo de elocución homogéneo en todos los países hispanohablantes. Forzar un metrónomo a 85 BPM en un paciente de la región andina o imponer un ritmo rígido en el Caribe puede inducir disritmias articulatorias.

Cadensa incorpora 5 presets de calibración fonoaudiológica regional (`src/lib/phoneticPresets.ts`):

| Dialecto Regional | Región / Países | Tempo Sugerido | Tasa Silábica | Características Acústicas y Formantes |
| :--- | :--- | :--- | :--- | :--- |
| **México Central** (`mexico_central`) | 🇲🇽 México | 80 BPM | 4.8 síl/s | Articulación equilibrada con conservación de oclusivas; formante /a/ estándar en 750/1200 Hz. |
| **Cono Sur / Rioplatense** (`cono_sur`) | 🇦🇷 Argentina / Uruguay / Chile | 78 BPM | 4.5 síl/s | Cadencia melódica con alargamiento de vocales tónicas; musicalidad aprovechable para ataques suaves. |
| **Andino** (`andino`) | 🇵🇪 Perú / Bolivia / Ecuador | 74 BPM | 4.2 síl/s | Tempo más pausado y vocales tensas sin elisiones; óptimo para isocronía estricta de sílaba por pulso. |
| **Caribeño** (`caribe`) | 🇨🇺 Caribe / Colombia / Venezuela | 86 BPM | 5.4 síl/s | Ritmo rápido y aspiración consonántica; requiere regulación para no precipitar bloqueos. |
| **Castellano Peninsular** (`iberico`) | 🇪🇸 España | 80 BPM | 5.0 síl/s | Distinción interdental /θ/ y firmeza articulatoria; exige vigilar contacto ligero en consonantes oclusivas. |

---

## 3. Arquitectura de Interlinking SEO y Crawlers en Pie de Página

Para resolver de manera permanente el déficit de descubrimiento de páginas hijas detectado en Bing Webmaster Tools (`AnchorCount: 0`, `TotalChildUrlCount: 0`), se unificó la arquitectura de pie de página mediante el componente `src/components/Footer.tsx`.

El componente establece enlaces canónicos e hipervínculos HTML directos (`<a>` vía Next.js `Link`) hacia las 7 técnicas fonoaudiológicas clínicas:
- `/tecnicas/sts` (Habla Rítmica Silábica)
- `/tecnicas/easy_onset` (Inicio Suave)
- `/tecnicas/light_contact` (Contacto Articulador Ligero)
- `/tecnicas/prolonged_speech` (Habla Prolongada)
- `/tecnicas/box_breathing` (Respiración Cuadrada 4-4-4-4)
- `/tecnicas/pull_out` (Modificación en Bloqueo)
- `/tecnicas/cancellation` (Cancelación Post-Bloqueo)

Esto garantiza que cualquier robot de indexación (Googlebot, Bingbot, Yandexbot) que acceda a cualquier vista de Cadensa rastree de inmediato las páginas hijas con contenido editorial especializado, potenciando la relevancia orgánica en búsquedas clínicas de tartamudez y fonoaudiología.
