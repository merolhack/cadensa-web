/**
 * Cadensa Rhythm & Timing Utilities
 * Herramientas de cálculo de tempo y cadencia para el habla rítmica silábica.
 */

export interface RhythmPace {
  bpm: number;
  intervalMs: number;
  totalDurationMs: number;
}

/**
 * Calcula el intervalo en milisegundos entre pulsos para un BPM determinado.
 * @param bpm Pulsos por minuto (debe ser mayor a 0)
 */
export function calculateBeatIntervalMs(bpm: number): number {
  if (bpm <= 0) {
    throw new Error('El valor de BPM debe ser mayor a 0');
  }
  return Math.round((60 / bpm) * 1000);
}

/**
 * Calcula la duración estimada de una secuencia rítmica de sílabas.
 * @param bpm Pulsos por minuto
 * @param syllableCount Número de sílabas
 */
export function calculateSequenceDurationMs(bpm: number, syllableCount: number): number {
  if (syllableCount < 0) {
    throw new Error('El conteo de sílabas no puede ser negativo');
  }
  const interval = calculateBeatIntervalMs(bpm);
  return interval * syllableCount;
}

/**
 * Valida si un BPM se encuentra dentro del rango clínico recomendado (60 a 160 BPM).
 * @param bpm Pulsos por minuto
 */
export function isClinicallyRecommendedBpm(bpm: number): boolean {
  return bpm >= 60 && bpm <= 160;
}
