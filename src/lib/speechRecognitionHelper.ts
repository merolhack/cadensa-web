/**
 * Cadensa On-Device Phonetic Recognition & Verification Helper
 * Valida la precisión de articulación fonética comparando la emisión del paciente
 * contra la frase o sílaba objetivo en el navegador (Zero Trust).
 */

export interface PhoneticMatchResult {
  targetPhrase: string;
  spokenPhrase: string;
  matchPercentage: number;
  isAccurate: boolean;
  matchedTokens: string[];
  omittedTokens: string[];
  extraTokens: string[];
  clinicalFeedback: string;
}

/**
 * Normaliza una cadena de texto para comparación fonética básica en español:
 * minúsculas, sin puntuación y sin espacios duplicados.
 */
export function normalizePhoneticText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes para evaluar el fonema base
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Calcula la distancia de Levenshtein entre dos cadenas de caracteres.
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Compara la frase u oración pronunciada con el texto objetivo y genera un diagnóstico foniátrico.
 */
export function evaluatePhoneticMatch(
  targetPhrase: string,
  spokenPhrase: string,
  minAcceptablePercentage: number = 75
): PhoneticMatchResult {
  const normTarget = normalizePhoneticText(targetPhrase);
  const normSpoken = normalizePhoneticText(spokenPhrase);

  if (!normTarget) {
    return {
      targetPhrase,
      spokenPhrase,
      matchPercentage: 0,
      isAccurate: false,
      matchedTokens: [],
      omittedTokens: [],
      extraTokens: [],
      clinicalFeedback: 'Frase objetivo vacía.',
    };
  }

  if (!normSpoken) {
    const targetWords = normTarget.split(' ');
    return {
      targetPhrase,
      spokenPhrase,
      matchPercentage: 0,
      isAccurate: false,
      matchedTokens: [],
      omittedTokens: targetWords,
      extraTokens: [],
      clinicalFeedback: 'No se detectó articulación verbal en la entrada de audio.',
    };
  }

  const targetWords = normTarget.split(' ');
  const spokenWords = normSpoken.split(' ');

  const matchedTokens: string[] = [];
  const omittedTokens: string[] = [];
  const spokenSet = new Set(spokenWords);

  targetWords.forEach((word) => {
    if (spokenSet.has(word)) {
      matchedTokens.push(word);
    } else {
      // Buscar coincidencia cercana por Levenshtein si el error es menor a 2 caracteres
      const closeMatch = spokenWords.find(
        (sw) => calculateLevenshteinDistance(word, sw) <= 1
      );
      if (closeMatch) {
        matchedTokens.push(word);
      } else {
        omittedTokens.push(word);
      }
    }
  });

  const targetSet = new Set(targetWords);
  const extraTokens = spokenWords.filter((sw) => !targetSet.has(sw));

  // Cálculo porcentual combinado: token-level y similitud Levenshtein global
  const maxLen = Math.max(normTarget.length, normSpoken.length);
  const charDistance = calculateLevenshteinDistance(normTarget, normSpoken);
  const charSimilarity = Math.max(0, 1 - charDistance / maxLen);

  const tokenSimilarity = matchedTokens.length / targetWords.length;
  const combinedScore = Math.round((tokenSimilarity * 0.6 + charSimilarity * 0.4) * 100);

  const isAccurate = combinedScore >= minAcceptablePercentage;

  let clinicalFeedback = '';
  if (combinedScore >= 90) {
    clinicalFeedback = '¡Articulación fonética nítida y completa! Coincidencia fonemática óptima.';
  } else if (combinedScore >= 70) {
    clinicalFeedback = 'Articulación comprensible. Se detectaron variaciones leves en algunas consonantes.';
  } else {
    clinicalFeedback = 'Se detectaron omisiones o bloqueos prolongados. Se sugiere segmentar la frase con metrónomo más lento.';
  }

  return {
    targetPhrase,
    spokenPhrase,
    matchPercentage: combinedScore,
    isAccurate,
    matchedTokens,
    omittedTokens,
    extraTokens,
    clinicalFeedback,
  };
}

/**
 * Determina si la Web Speech API está soportada en el navegador actual.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}
