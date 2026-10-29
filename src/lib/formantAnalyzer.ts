/**
 * Cadensa Acoustic Formant Analyzer
 * Estima los formantes foniátricos F1 (apertura mandibular) y F2 (posición lingual)
 * para proporcionar biofeedback visual en tiempo real del espacio vocálico.
 */

export interface FormantTarget {
  vowel: 'a' | 'e' | 'i' | 'o' | 'u';
  f1: number; // Hz (Apertura mandibular)
  f2: number; // Hz (Posición lingual)
  label: string;
}

/**
 * Centros acústicos de formantes para las 5 vocales del español estándar.
 */
export const SPANISH_VOWEL_FORMANTS: Record<string, FormantTarget> = {
  a: { vowel: 'a', f1: 800, f2: 1350, label: 'Abierta central (/a/)' },
  e: { vowel: 'e', f1: 500, f2: 1800, label: 'Media anterior (/e/)' },
  i: { vowel: 'i', f1: 280, f2: 2250, label: 'Cerrada anterior (/i/)' },
  o: { vowel: 'o', f1: 500, f2: 1000, label: 'Media posterior (/o/)' },
  u: { vowel: 'u', f1: 300, f2: 800, label: 'Cerrada posterior (/u/)' },
};

export interface FormantAnalysisResult {
  f1: number;
  f2: number;
  closestVowel: string;
  distanceToTarget: number;
  mandibularAperture: 'Abierta' | 'Media' | 'Cerrada';
  lingualPosition: 'Anterior' | 'Central' | 'Posterior';
}

/**
 * Clasifica la vocal más cercana en el espacio acústico F1/F2 según distancia euclidiana ponderada.
 */
export function classifyVowelFromFormants(f1: number, f2: number): string {
  let closest = 'a';
  let minDistance = Infinity;

  Object.values(SPANISH_VOWEL_FORMANTS).forEach((target) => {
    // Ponderación foniátrica de formantes
    const dist = Math.sqrt(
      Math.pow((f1 - target.f1) * 1.5, 2) + Math.pow(f2 - target.f2, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = target.vowel;
    }
  });

  return closest;
}

/**
 * Analiza un par de formantes F1/F2 y devuelve el diagnóstico biomecánico del tracto vocal.
 */
export function analyzeVocalTractKinematics(f1: number, f2: number): FormantAnalysisResult {
  const closestVowel = classifyVowelFromFormants(f1, f2);
  const target = SPANISH_VOWEL_FORMANTS[closestVowel];

  const distanceToTarget = Math.round(
    Math.sqrt(Math.pow((f1 - target.f1) * 1.5, 2) + Math.pow(f2 - target.f2, 2))
  );

  let mandibularAperture: 'Abierta' | 'Media' | 'Cerrada' = 'Media';
  if (f1 >= 650) {
    mandibularAperture = 'Abierta';
  } else if (f1 <= 380) {
    mandibularAperture = 'Cerrada';
  }

  let lingualPosition: 'Anterior' | 'Central' | 'Posterior' = 'Central';
  if (f2 >= 1600) {
    lingualPosition = 'Anterior';
  } else if (f2 <= 1100) {
    lingualPosition = 'Posterior';
  }

  return {
    f1: Math.round(f1),
    f2: Math.round(f2),
    closestVowel,
    distanceToTarget,
    mandibularAperture,
    lingualPosition,
  };
}

/**
 * Estima los dos primeros picos de formantes a partir de un arreglo de magnitudes de FFT.
 */
export function estimateFormantsFromSpectrum(
  fftMagnitudes: Float32Array,
  sampleRate: number = 44100
): { f1: number; f2: number } {
  if (fftMagnitudes.length === 0) {
    return { f1: 500, f2: 1500 };
  }

  const binWidth = sampleRate / (fftMagnitudes.length * 2);

  // Rango para F1: 200 Hz a 1000 Hz
  const f1MinBin = Math.floor(200 / binWidth);
  const f1MaxBin = Math.floor(1000 / binWidth);

  let f1PeakBin = f1MinBin;
  let f1PeakVal = -Infinity;

  for (let i = f1MinBin; i <= f1MaxBin && i < fftMagnitudes.length; i++) {
    if (fftMagnitudes[i] > f1PeakVal) {
      f1PeakVal = fftMagnitudes[i];
      f1PeakBin = i;
    }
  }

  // Rango para F2: 800 Hz a 2600 Hz (después del F1 encontrado)
  const f2MinBin = Math.max(f1PeakBin + 2, Math.floor(800 / binWidth));
  const f2MaxBin = Math.floor(2600 / binWidth);

  let f2PeakBin = f2MinBin;
  let f2PeakVal = -Infinity;

  for (let i = f2MinBin; i <= f2MaxBin && i < fftMagnitudes.length; i++) {
    if (fftMagnitudes[i] > f2PeakVal) {
      f2PeakVal = fftMagnitudes[i];
      f2PeakBin = i;
    }
  }

  const f1 = Math.round(f1PeakBin * binWidth);
  const f2 = Math.round(f2PeakBin * binWidth);

  return {
    f1: Math.max(250, Math.min(1000, f1)),
    f2: Math.max(800, Math.min(2600, f2)),
  };
}
