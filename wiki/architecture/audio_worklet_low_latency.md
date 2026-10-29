---
title: "Procesador de Audio Worklet de Ultra-Baja Latencia (< 5ms)"
category: "architecture"
tags: [architecture, web-audio, audio-worklet, vad, latency, zero-trust]
last_updated: "2026-10-28"
sources:
  - "src/lib/audioWorkletHelper.ts"
related:
  - "wiki/architecture/audio_engine.md"
  - "wiki/concepts/clinical_report_and_jitter.md"
---

# Procesador de Audio Worklet de Ultra-Baja Latencia (< 5ms)

La captura de audio para fonoaudiología en tiempo real requiere sincronía estricta para no atribuir errores de latencia del navegador a la precisión fonatoria del paciente.

---

## 1. Problema de la API Clásica en el Hilo Principal

En implementaciones basadas en `ScriptProcessorNode` o `setInterval` con `AnalyserNode`, el cálculo del Voice Onset Time (VOT) sufre interferencias por:
* Ciclos de recolección de basura (Garbage Collection) de JavaScript.
* Re-renderizados y mutaciones del DOM en React.
* Jitter del hilo principal que oscila entre 15 ms y 50 ms.

---

## 2. Arquitectura con AudioWorklet

`src/lib/audioWorkletHelper.ts` encapsula `CadensaVADProcessor` como un `AudioWorkletProcessor`:

```javascript
class CadensaVADProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // Procesa bloques de 128 muestras (~2.67 ms a 48kHz)
    // en un hilo de renderizado de audio de alta prioridad.
  }
}
```

### Ventajas:
1. **Hilo Aislado**: Corre fuera del Event Loop del hilo de UI.
2. **Latencia Sub-5ms**: Detecta la onda acústica en un margen inferior a 3 milisegundos.
3. **Resiliencia y Fallback Transparente**: Si el navegador no soporta `audioWorklet` (o en contextos restringidos), conmuta automáticamente a `AnalyserNode` sin interrumpir la experiencia.

