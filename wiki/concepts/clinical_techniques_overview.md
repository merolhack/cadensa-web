---
title: "Compendio General de Técnicas Clínicas de Fluidez en Cadensa"
category: "concepts"
tags: [clinical, speech-therapy, fluency-shaping, stuttering-modification, overview]
last_updated: "2026-10-24"
sources:
  - "wiki/raw/clinical_foundations.md"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/concepts/easy_onset.md"
  - "wiki/concepts/light_articulatory_contact.md"
  - "wiki/concepts/prolonged_speech.md"
  - "wiki/concepts/box_breathing.md"
  - "wiki/concepts/pull_out_technique.md"
  - "wiki/concepts/cancellation_technique.md"
---

# Compendio General de Técnicas Clínicas de Fluidez

Cadensa no es un simple metrónomo digital; es una **estación fonoaudiológica integral y multimodal** que implementa las 7 técnicas con mayor evidencia científica en el tratamiento de la disfemia (tartamudez) y la desregulación motriz del habla.

---

## 1. Clasificación Fonoaudiológica de las 7 Técnicas

En la fonoaudiología moderna y la terapia del habla, las técnicas se dividen en tres grandes familias clínicas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MOLDEAMIENTO DE LA FLUIDEZ (Fluency Shaping)                            │
│ Reconfiguran el patrón motor antes y durante la fonación:                   │
│ - Habla Rítmica Silábica (STS)                                              │
│ - Inicio Vocal Suave (Easy Onset)                                           │
│ - Contacto Articular Ligero (Light Contact)                                 │
│ - Habla Prolongada y Fonación Continua (Prolonged Speech)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. MODIFICACIÓN DEL TARTAMUDEO (Stuttering Modification - Van Riper)        │
│ Desactivan el espasmo cuando el bloqueo ya se presenta:                     │
│ - Desactivación Activa en Bloqueo (Pull-Out)                                │
│ - Cancelación Consciente Post-Bloqueo (Cancellation)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. REGULACIÓN NEUROVEGETATIVA Y AUTÓNOMA                                    │
│ Estabilizan el sistema nervioso y la presión de aire subglótica:            │
│ - Respiración Cuadrada Diafragmática (Box Breathing 4-4-4-4)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matriz Comparativa de Técnicas en Cadensa

| Técnica | Familia Clínica | Enfoque Anatómico | Estímulo en Cadensa | Meta Fisiológica |
|---|---|---|---|---|
| **1. Habla Rítmica (STS)** | *Fluency Shaping* | Ganglios basales / Corteza premotora | Metrónomo auditivo/visual a compás (70 BPM) | Isocronía silábica que elude el circuito deficitario interno. |
| **2. Inicio Vocal Suave** | *Fluency Shaping* | Glotis / Músculo cricoaritenoideo lateral | Rampa de 3 pasos (3.0s): Suspiro → Subida → Voz | Evitar el choque oclusivo de cuerdas vocales antes de emitir vocales. |
| **3. Contacto Ligero** | *Fluency Shaping* | Labios, lengua, paladar duro y velo | Monitoreo táctil pluma (≤ 30% de presión) | Evitar el taponamiento mecánico en consonantes oclusivas (/p, t, k, b, d, g/). |
| **4. Habla Prolongada** | *Fluency Shaping* | Fonación continua / Control cordal | Visualizador de onda elástica y ligado vocal | Eliminar cortes abruptos de aire, estirando la vocal al doble (legato 2.2s). |
| **5. Respiración Cuadrada** | *Regulación Autónoma* | Nervio vago / Diafragma | Orbe respiratorio pulsante (4s-4s-4s-4s) | Reducir el tono simpático (ansiedad) y evitar fonar sin reserva aérea. |
| **6. Salida Suave (Pull-Out)** | *Van Riper* | Mecánica laríngea durante el espasmo | Consola de 3 etapas: Congelar → Aflojar → Deslizar | No empujar el bloqueo con fuerza; relajar mandíbula y fluir hacia la vocal. |
| **7. Cancelación** | *Van Riper* | Respuesta psicológica post-espasmo | Cronómetro regresivo de pausa reflexiva (3s) | Detener la frustración tras un bloqueo, pausar 3s y reintentar con inicio suave. |

---

## 3. Principio de Progresión y Sinergia

En un protocolo clínico real, estas técnicas no compiten entre sí, sino que se complementan en fases sucesivas:

1. **Fase Preparatoria:** El usuario estabiliza el diafragma y la tasa cardíaca mediante [Respiración Cuadrada](box_breathing.md).
2. **Fase de Moldeamiento Base:** Aprende a atacar las vocales con [Inicio Vocal Suave](easy_onset.md) y las consonantes duras con [Contacto Ligero](light_articulatory_contact.md).
3. **Fase de Integración y Ritmo:** Enlaza el discurso continuo con [Habla Rítmica (STS)](syllable_timed_speech.md) y [Habla Prolongada](prolonged_speech.md).
4. **Fase de Rescate en Situaciones Reales:** Si sobreviene un bloqueo involuntario, aplica [Pull-Out](pull_out_technique.md) para salir de él sin empujar, o [Cancelación](cancellation_technique.md) para reiniciar la palabra con calma.

---

## 4. Implementación en la Arquitectura de Cadensa

Cada técnica cuenta con:
* Un identificador tipado en `src/lib/clinicalTechniques.ts`.
* Botón de acción diferenciado con icono y texto operacional específico.
* Visualizador dedicado en `src/components/TechniqueVisualizer.tsx` aislado de interferencias de metrónomo.
* Mecanismo de avance silábico automático y manual, completamente verificado mediante pruebas automatizadas y BDD.
