/**
 * Cadensa Voice Detection & Rhythmic Timing Comparator
 * Captura audio del micrófono, detecta inicios de voz (Voice Onset Time)
 * y evalúa la precisión contra el pulso isocrónico del metrónomo.
 */

export type PrecisionGrade = 'perfect' | 'good' | 'miss';

export interface AccuracyResult {
  grade: PrecisionGrade;
  diffMs: number;
  score: number;
  label: string;
}

/**
 * Evalúa la precisión rítmica comparando la marca de tiempo de la voz con el pulso ideal.
 * @param speechTimeMs Milisegundos del inicio de la voz
 * @param beatTimeMs Milisegundos del pulso del metrónomo
 */
export function evaluateRhythmicAccuracy(
  speechTimeMs: number,
  beatTimeMs: number
): AccuracyResult {
  const diffMs = Math.round(Math.abs(speechTimeMs - beatTimeMs));

  if (diffMs <= 60) {
    return {
      grade: 'perfect',
      diffMs,
      score: 100,
      label: '¡A compás perfecto! (±60ms)',
    };
  }

  if (diffMs <= 120) {
    return {
      grade: 'good',
      diffMs,
      score: 80,
      label: 'Buen ritmo (±120ms)',
    };
  }

  return {
    grade: 'miss',
    diffMs,
    score: 40,
    label: 'Desfasado del compás',
  };
}

/**
 * Dispara una micro-vibración háptica de confirmación en dispositivos móviles compatibles.
 */
export function triggerHapticFeedback(pattern: number | number[] = 25): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Calcula la energía de onda (RMS) a partir de un arreglo de muestras de audio PCM.
 */
export function calculateAudioRMS(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Determina si el nivel de energía supera el umbral de actividad de voz (VAD).
 */
export function isVoiceActive(rms: number, threshold = 0.04): boolean {
  return rms >= threshold;
}
