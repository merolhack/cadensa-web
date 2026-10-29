/**
 * Cadensa Diadochokinesis (DDK) Clinical Engine
 * Mide la Tasa Motora Articulatoria (sílabas por segundo) y la regularidad temporal
 * en secuencias de repetición rápida (ej: /pa-ta-ka/, /ba-da-ga/).
 */

export type DDKSequenceType = 'pa-ta-ka' | 'ba-da-ga' | 'tra-kla-pra' | 'pa-pa-pa';

export interface DDKSequenceInfo {
  id: DDKSequenceType;
  label: string;
  syllables: string[];
  clinicalFocus: string;
  targetBpm: number;
}

export const DDK_SEQUENCES: Record<DDKSequenceType, DDKSequenceInfo> = {
  'pa-ta-ka': {
    id: 'pa-ta-ka',
    label: '/pa - ta - ka/ (Secuencia Estándar)',
    syllables: ['pa', 'ta', 'ka'],
    clinicalFocus: 'Coordinación anteroposterior: bilabial (/p/), alveolar (/t/) y velar (/k/).',
    targetBpm: 80,
  },
  'ba-da-ga': {
    id: 'ba-da-ga',
    label: '/ba - da - ga/ (Sonoras Suaves)',
    syllables: ['ba', 'da', 'ga'],
    clinicalFocus: 'Control de fonación glótica continua y reducción del espasmo laríngeo.',
    targetBpm: 75,
  },
  'tra-kla-pra': {
    id: 'tra-kla-pra',
    label: '/tra - kla - pra/ (Trabadas Complejas)',
    syllables: ['tra', 'kla', 'pra'],
    clinicalFocus: 'Agilidad motora en grupos consonánticos líquidos y oclusivos.',
    targetBpm: 85,
  },
  'pa-pa-pa': {
    id: 'pa-pa-pa',
    label: '/pa - pa - pa/ (Monosilábica Bilabial)',
    syllables: ['pa', 'pa', 'pa'],
    clinicalFocus: 'Fuerza, cierre y velocidad de oclusión bilabial repetitiva.',
    targetBpm: 90,
  },
};

export interface DDKAssessmentResult {
  sequence: DDKSequenceType;
  durationSeconds: number;
  syllableCount: number;
  rateSyllablesPerSecond: number;
  averageIntervalMs: number;
  jitterMs: number;
  rateClassification: 'Óptima' | 'Adecuada' | 'Lenta';
  regularityClassification: 'Muy Regular' | 'Variabilidad Moderada' | 'Disritmia / Irregular';
  clinicalSummary: string;
}

/**
 * Calcula los resultados clínicos fonoaudiológicos de una prueba diadococinética.
 */
export function evaluateDDKTrial(
  sequence: DDKSequenceType,
  onsetTimestampsMs: number[],
  trialDurationSeconds: number
): DDKAssessmentResult {
  const count = onsetTimestampsMs.length;
  const duration = Math.max(1, trialDurationSeconds);
  const rate = Math.round((count / duration) * 10) / 10;

  if (count < 2) {
    return {
      sequence,
      durationSeconds: duration,
      syllableCount: count,
      rateSyllablesPerSecond: rate,
      averageIntervalMs: 0,
      jitterMs: 0,
      rateClassification: 'Lenta',
      regularityClassification: 'Disritmia / Irregular',
      clinicalSummary: 'Registro insuficiente de sílabas para calcular la tasa motora articulatoria.',
    };
  }

  // Intervalos inter-silábicos
  const intervals: number[] = [];
  for (let i = 1; i < onsetTimestampsMs.length; i++) {
    intervals.push(onsetTimestampsMs[i] - onsetTimestampsMs[i - 1]);
  }

  const averageInterval = Math.round(
    intervals.reduce((sum, val) => sum + val, 0) / intervals.length
  );

  // Desviación estándar (jitter temporal)
  const variance =
    intervals.reduce((sum, val) => sum + Math.pow(val - averageInterval, 2), 0) /
    intervals.length;
  const jitterMs = Math.round(Math.sqrt(variance));

  // Clasificación de Tasa (normas de adultos hispanohablantes ~5.0 - 6.5 síl/seg)
  let rateClassification: 'Óptima' | 'Adecuada' | 'Lenta' = 'Adecuada';
  if (rate >= 5.0) {
    rateClassification = 'Óptima';
  } else if (rate < 3.5) {
    rateClassification = 'Lenta';
  }

  // Clasificación de Regularidad temporal
  let regularityClassification: 'Muy Regular' | 'Variabilidad Moderada' | 'Disritmia / Irregular' = 'Variabilidad Moderada';
  if (jitterMs <= 35) {
    regularityClassification = 'Muy Regular';
  } else if (jitterMs > 60) {
    regularityClassification = 'Disritmia / Irregular';
  }

  let clinicalSummary = '';
  if (rateClassification === 'Óptima' && regularityClassification === 'Muy Regular') {
    clinicalSummary = 'Excelente coordinación motriz del habla con cadencia rítmica isocrónica y rápida.';
  } else if (regularityClassification === 'Disritmia / Irregular') {
    clinicalSummary = 'Se detectan fluctuaciones temporales entre sílabas. Se sugiere practicar con metrónomo a tempo moderado para afianzar la isocronía.';
  } else if (rateClassification === 'Lenta') {
    clinicalSummary = 'Velocidad articulatoria reducida. Priorizar ejercicios de fonación relajada y aumento gradual del tempo.';
  } else {
    clinicalSummary = 'Tasa motora y estabilidad temporal dentro de parámetros foniátricos compensatorios adecuados.';
  }

  return {
    sequence,
    durationSeconds: duration,
    syllableCount: count,
    rateSyllablesPerSecond: rate,
    averageIntervalMs: averageInterval,
    jitterMs,
    rateClassification,
    regularityClassification,
    clinicalSummary,
  };
}

