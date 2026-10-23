---
title: "Arquitectura del Motor de Audio y Metrónomo Web Audio API"
category: "architecture"
tags: [architecture, web-audio, metronome, timing, rhythm, sts]
last_updated: "2026-10-23"
sources:
  - "src/lib/audioMetronome.ts"
  - "src/lib/rhythm.ts"
  - "src/components/MetronomeVisual.tsx"
related:
  - "wiki/concepts/syllable_timed_speech.md"
  - "wiki/architecture/frontend.md"
  - "wiki/architecture/testing.md"
---

# Arquitectura del Motor de Audio y Metrónomo Web Audio API

El entrenamiento de habla rítmica silábica (STS) requiere una referencia temporal acústica de **precisión estricta y jitter cero**. Las funciones convencionales de JavaScript como `setInterval` o `setTimeout` son vulnerables a retrasos provocados por el event loop y tareas pesadas de renderizado.

Para garantizar exactitud milimétrica, Cadensa implementa un motor de audio nativo basado en el **Web Audio API** y el patrón de programación anticipada (*lookahead scheduler*).

---

## 1. Principio del Programador Lookahead (*Lookahead Scheduler*)

```
[ Reloj de Hardware: AudioContext.currentTime ]
                       ▲
                       │ Programa con anticipación (0.1s)
┌──────────────────────┴─────────────────────────────────────┐
│ scheduler() [setInterval cada 25ms]                        │
│ - Comprueba si nextNoteTime < currentTime + 0.1s          │
│ - Dispara scheduleNote() en el hardware de audio           │
│ - Emite callback a la UI para animación sincronizada       │
│ - Incrementa nextNoteTime += (60 / bpm)                   │
└────────────────────────────────────────────────────────────┘
```

### Parámetros de Temporización:
- **`lookaheadMs = 25.0`**: Intervalo en milisegundos con el que el temporizador comprueba si es necesario programar nuevos eventos.
- **`scheduleAheadTimeSec = 0.1`**: Ventana de anticipación de 100 ms dentro de la cual los nodos de audio son encolados en el hardware.
- **`AudioContext.currentTime`**: Referencia de reloj de alta precisión de la tarjeta de sonido, inmune a bloqueos del hilo principal de JavaScript.

---

## 2. Síntesis Acústica y Envolvente

Para evitar la fatiga auditiva de metrónomos mecánicos estridentes, el oscilador genera una onda senoidal suave modulada por ganancia exponencial:

```typescript
// Frecuencia principal en compás 1 (880 Hz) y secundaria en tiempos débiles (587.33 Hz)
osc.type = 'sine';
osc.frequency.value = beat % 4 === 0 ? 880 : 587.33;

// Decaimiento rápido tipo percusión de madera (woodblock)
gainNode.gain.setValueAtTime(0.3, time);
gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
```

---

## 3. Sincronización Multisensorial con la UI

El motor desacopla el hilo de síntesis de sonido del hilo de renderizado de React:
1. `AudioMetronome` programa el sonido en el hardware.
2. Calcula el desfase exacto `(time - currentTime) * 1000` y emite un `setTimeout` compensado hacia el callback `onTick(beat, time)`.
3. El componente `MetronomeVisual` actualiza el orbe pulsante y los círculos concéntricos.
4. El componente `SyllableReader` avanza el resaltado hacia la siguiente sílaba de forma perfectamente sincronizada con el impacto auditivo.
