---
title: "Biofeedback de Formantes F1/F2 y Cinemática del Tracto Vocal"
category: "concepts"
tags: [clinical, formants, biofeedback, speech-therapy, acoustics, vocal-quadrilateral]
last_updated: "2026-10-28"
sources:
  - "src/lib/formantAnalyzer.ts"
  - "src/components/FormantBiofeedbackVisualizer.tsx"
related:
  - "wiki/concepts/light_articulatory_contact.md"
  - "wiki/concepts/prolonged_speech.md"
---

# Biofeedback de Formantes F1/F2 y Cinemática del Tracto Vocal

Los **formantes** son resonancias acústicas del tracto vocal generadas por la posición de los órganos fonoarticuladores (mandíbula, lengua y labios) durante la fonación.

---

## 1. Significado Clínico en Tartamudez y Disfemia

Los bloqueos de inicio vocal (*blocks*) frecuentemente cursan con hiperaducción laríngea y contractura mandibular:
* **Primer Formante (F1)**:
  - Rango: 250 Hz a 900 Hz.
  - Se correlaciona directamente con la **apertura mandibular**: a mayor descenso de la mandíbula (vocal /a/), mayor es F1 (~800 Hz); en vocales cerradas (/i/, /u/) F1 es bajo (~280-300 Hz).
  - Un F1 anómalamente bajo o inestable durante vocales abiertas revela contractura maseterina y tensión cervical.
* **Segundo Formante (F2)**:
  - Rango: 800 Hz a 2500 Hz.
  - Se correlaciona con el **eje anteroposterior lingual**: vocales anteriores (/i/, /e/) presentan F2 elevado (~1800-2300 Hz); vocales posteriores (/u/, /o/) muestran F2 bajo (~800-1000 Hz).

---

## 2. El Cuadrilátero Vocálico en Pantalla

El componente `src/components/FormantBiofeedbackVisualizer.tsx` grafica en dos dimensiones el espacio acústico de las vocales en español (/a/, /e/, /i/, /o/, /u/):
- Eje X invertido: F2 (anterior a posterior).
- Eje Y invertido: F1 (cerrada a abierta).
- Proporciona retroalimentación propioceptiva instantánea para afianzar *Contactos Articulatorios Suaves* y fonación sin esfuerzo.
