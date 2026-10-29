---
title: "Informe Clínico Fonoaudiológico y Jitter Vocal Inter-Silábico"
category: "concepts"
tags: [clinical, reporting, jitter, fonoaudiologia, speech-therapy, pdf-export]
last_updated: "2026-10-28"
sources:
  - "src/lib/clinicalReport.ts"
  - "src/components/ClinicalReportExporter.tsx"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/diadochokinesis_assessment.md"
  - "wiki/architecture/frontend.md"
---

# Informe Clínico Fonoaudiológico y Jitter Vocal Inter-Silábico

El módulo de **Informes Clínicos Fonoaudiológicos** (`src/lib/clinicalReport.ts`) permite exportar los progresos terapéuticos del paciente en un formato formal para fonoaudiólogos, neurólogos del habla y terapeutas del lenguaje.

---

## 1. Métricas Cuantitativas Centrales

1. **Jitter Vocal Inter-Silábico (`vocalJitterMs`)**:
   - Mide la dispersión e inestabilidad temporal en milisegundos en relación al beat ideal del metrónomo.
   - En una práctica óptima con precisión ≥ 90%, el jitter se sitúa en ≤ 35 ms.
   - Si supera los 60 ms, se activan recomendaciones clínicas de respiración diafragmática previa y desaceleración del tempo.
2. **Nivel de Adherencia Rítmica**:
   - `Óptimo` (precisión ≥ 85%): Progresión de velocidad hacia habla fluida a 95-100 BPM.
   - `En Desarrollo` (70% - 84%): Consolidación isocrónica a 75-80 BPM.
   - `Requiere Refuerzo` (< 70%): Reducción de tempo hacia 65-70 BPM y foco en diadococinesia.
3. **Volumen Silábico y Racha Terapéutica**:
   - Minutos acumulados, sílabas articuladas y racha activa en días.

---

## 2. Formatos de Salida

* **PDF Imprimible (`generatePrintableClinicalHtml`)**:
  Genera un documento HTML autónomo con estilos `@media print`, cabecera clínica profesional, cuadrícula de métricas, historial tabular de sesiones y directiva `window.print()` lista para guardar como PDF.
* **Texto Plano (`formatClinicalNotesText`)**:
  Formato estándar foniátrico para copiar y pegar directamente en expedientes médicos electrónicos (EHR).
* **JSON Raw (`exportDate`, `metrics`, `recentSessions`)**:
  Estructura serializable para analítica avanzada y consumo por APIs clínicas.

