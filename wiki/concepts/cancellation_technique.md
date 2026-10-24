---
title: "Concepto Clínico: Cancelación y Pausa Consciente (Cancellation de Van Riper)"
category: "concepts"
tags: [clinical, speech-therapy, cancellation, van-riper, post-block, stuttering-modification]
last_updated: "2026-10-24"
sources:
  - "wiki/raw/clinical_foundations.md"
related:
  - "wiki/concepts/clinical_techniques_overview.md"
  - "wiki/concepts/pull_out_technique.md"
  - "wiki/concepts/easy_onset.md"
---

# Concepto Clínico: Cancelación y Pausa Consciente (Cancellation)

La **Cancelación** (*Cancellation* o modificación posterior al bloqueo) es la tercera técnica fundamental del modelo de **Charles Van Riper**. Opera como un mecanismo de **reacondicionamiento neuroconductual** para extinguir el ciclo de frustración y escape que perpetúa la tartamudez severa.

---

## 1. El Problema Clínico: El Reflejo de Escape y la Frustración Residual

Cuando una persona con tartamudez sufre un bloqueo severo y finalmente logra "escupir" la palabra mediante un sobreesfuerzo violento:
1. El cerebro interpreta erróneamente que la fuerza muscular extrema fue la que "salvó" la situación (reforzamiento negativo de la lucha motriz).
2. Queda un residuo de vergüenza, aceleración cardíaca y rabia acumulada.
3. La persona corre a decir la siguiente palabra a toda velocidad, lo que garantiza un nuevo bloqueo casi inmediato.

---

## 2. El Protocolo de Cuatro Fases de la Cancelación

La Cancelación corta de raíz este círculo vicioso:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DETENCIÓN INMEDIATA                                      │
│ - Al terminar una palabra trabada con esfuerzo, o al sentir │
│   un bloqueo irreductible, DETENER el habla de inmediato.   │
├──────────────────────────────┬──────────────────────────────┤
│                              ▼                              │
│ 2. PAUSA CONSCIENTE DE 3 SEGUNDOS                           │
│ - Guardar silencio deliberado durante 3 segundos completos. │
│ - No hablar, no disculparse, no gesticular.                 │
│ - Permitir que el sistema simpático se desactive y los      │
│   músculos regresen al tono basal.                          │
├──────────────────────────────┬──────────────────────────────┤
│                              ▼                              │
│ 3. ANÁLISIS PROPIOCEPTIVO BREVE                             │
│ - Preguntarse mentalmente: "¿Dónde apreté? ¿En los labios,  │
│   en la lengua o en la garganta?".                          │
├──────────────────────────────┬──────────────────────────────┤
│                              ▼                              │
│ 4. REINTENTO CON INICIO SUAVE                               │
│ - Volver a pronunciar la misma palabra desde cero, pero     │
│   aplicando ahora Inicio Vocal Suave (Easy Onset) o         │
│   Contacto Articular Ligero (Light Contact).                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Implementación Interactiva en Cadensa

Cadensa traslada este protocolo a una experiencia digital guiada:

1. **Botón de Activación:** `⏸️ Iniciar Protocolo de Cancelación (3s)`.
2. **Cronómetro Regresivo de Pausa Reflexiva:** Muestra un círculo visual con conteo regresivo animado (`3 → 2 → 1`) con la indicación: *"Pausa consciente: Respira y suelta el cuello..."*.
3. **Autorización de Reintento:** Una vez transcurridos los 3 segundos completos de serenidad, la consola valida:
   `✅ ¡Pausa de 3s cumplida! Repite "{sílaba}" con Inicio Suave.`
4. **Avance Dinámico:** Botón `Siguiente Palabra ➡️` para pasar al siguiente ejercicio una vez lograda la repetición relajada.
