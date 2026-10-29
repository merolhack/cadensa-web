---
title: "Evaluación y Entrenamiento de Diadococinesia Oral (/pa-ta-ka/)"
category: "concepts"
tags: [clinical, diadochokinesis, ddk, speech-therapy, smr, amr, motor-rate]
last_updated: "2026-10-28"
sources:
  - "src/lib/diadochokinesis.ts"
  - "src/components/DiadochokinesisTrainer.tsx"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/clinical_report_and_jitter.md"
  - "wiki/architecture/about_and_roadmap_sync.md"
---

# Evaluación y Entrenamiento de Diadococinesia Oral (/pa-ta-ka/)

La **diadococinesia oral (DDK)** o tasa motora articulatoria es una prueba fonoaudiológica y neurológica estandarizada diseñada para cuantificar la velocidad, coordinación y regularidad temporal con la que un paciente puede repetir secuencias silábicas rápidas y alternantes.

---

## 1. Fundamento Clínico y Motor

En personas con tartamudez y disfluencias neuromotoras, la articulación rápida pone a prueba los circuitos cortico-estriatales y la retroalimentación auditivo-motora:

1. **SMR (Sequential Motion Rate - Tasa de Movimiento Secuencial)**:
   - Secuencia clásica: `/pa - ta - ka/`.
   - Evalúa la coordinación anteroposterior:
     - `/pa/`: Cierre y liberación bilabial (músculo orbicular de los labios, nervio craneal VII).
     - `/ta/`: Oclusión lingual alveolar anterosuperior (nervio craneal XII).
     - `/ka/`: Oclusión dorsolingual velar posterosuperior (nervios craneales IX y X).
2. **AMR (Alternating Motion Rate - Tasa de Movimiento Alternante Monosilábico)**:
   - Secuencia: `/pa - pa - pa/`.
   - Evalúa resistencia motora y fuerza de oclusión labial aislada.
3. **Variantes Fonéticas Avanzadas**:
   - `/ba - da - ga/`: Oclusivas sonoras que requieren vibración glótica continua sin espasmo laringotraqueal.
   - `/tra - kla - pra/`: Grupos consonánticos trabados líquidos.

---

## 2. Parámetros Cuantitativos e Interpretación

El motor en `src/lib/diadochokinesis.ts` calcula de forma automatizada:

* **Tasa Articulatoria (`rateSyllablesPerSecond`)**:
  Total de sílabas divididas entre los 10 segundos de la prueba.
  - **Óptima**: ≥ 5.0 síl/s (Norma estándar en adultos hispanohablantes: 5.0 a 6.5 síl/s).
  - **Adecuada**: 3.5 a 4.9 síl/s.
  - **Lenta**: < 3.5 síl/s.
* **Jitter Temporal Inter-Silábico (`jitterMs`)**:
  Desviación estándar de los intervalos inter-silábicos:
  - **Muy Regular**: ≤ 35 ms.
  - **Variabilidad Moderada**: 36 a 60 ms.
  - **Disritmia / Irregular**: > 60 ms (indica dificultad en la isocronía del habla).

---

## 3. Integración en Cadensa

El componente `src/components/DiadochokinesisTrainer.tsx` permite al usuario practicar la secuencia de 10 segundos con pulsos táctiles o por teclado (Barra espaciadora), emitiendo feedback visual de cadencia inmediata y diagnóstico foniátrico.

