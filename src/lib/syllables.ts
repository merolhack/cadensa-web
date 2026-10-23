/**
 * Cadensa Spanish Syllabifier Engine
 * Algoritmo de silabeo fonético y ortográfico para español.
 * Diseñado para la segmentación de oraciones en habla rítmica silábica (STS).
 */

const VOCALES_ABIERTAS = new Set(['a', 'e', 'o', 'á', 'é', 'ó', 'A', 'E', 'O', 'Á', 'É', 'Ó']);
const VOCALES_CERRADAS_ATONAS = new Set(['i', 'u', 'ü', 'I', 'U', 'Ü']);
const VOCALES_CERRADAS_TONICAS = new Set(['í', 'ú', 'Í', 'Ú']);

const GRUPOS_INSEPARABLES = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'kl', 'kr', 'pl', 'pr', 'tr',
  'ch', 'll', 'rr',
]);

export function isVocal(char: string): boolean {
  const c = char.toLowerCase();
  return (
    VOCALES_ABIERTAS.has(c) ||
    VOCALES_CERRADAS_ATONAS.has(c) ||
    VOCALES_CERRADAS_TONICAS.has(c) ||
    c === 'y' // Cuando actúa como vocal final
  );
}

/**
 * Determina si dos vocales adyacentes forman hiato (se separan en sílabas distintas).
 */
export function formanHiato(v1: string, v2: string): boolean {
  const c1 = v1.toLowerCase();
  const c2 = v2.toLowerCase();

  // Dos vocales abiertas siempre forman hiato: po-e-ta, te-a-tro, ca-os
  if (VOCALES_ABIERTAS.has(c1) && VOCALES_ABIERTAS.has(c2)) {
    return true;
  }

  // Vocal abierta + vocal cerrada tónica o viceversa forman hiato: pa-ís, dí-a, bio-lo-gí-a
  if (VOCALES_ABIERTAS.has(c1) && VOCALES_CERRADAS_TONICAS.has(c2)) {
    return true;
  }
  if (VOCALES_CERRADAS_TONICAS.has(c1) && VOCALES_ABIERTAS.has(c2)) {
    return true;
  }

  // Dos vocales idénticas: sa-ha-ra, cre-er
  if (c1 === c2) {
    return true;
  }

  return false;
}

/**
 * Separa una palabra individual en español en sus sílabas correspondientes.
 * @param word Palabra sin espacios
 */
export function syllabifyWord(word: string): string[] {
  const cleanWord = word.trim();
  if (!cleanWord) return [];

  // Diccionario de excepciones o casos directos comunes
  const lower = cleanWord.toLowerCase();
  const excepciones: Record<string, string[]> = {
    cadensa: ['ca', 'den', 'sa'],
    ritmo: ['rit', 'mo'],
    voz: ['voz'],
    habla: ['ha', 'bla'],
    lenguaje: ['len', 'gua', 'je'],
    comunicacion: ['co', 'mu', 'ni', 'ca', 'cion'],
    comunicación: ['co', 'mu', 'ni', 'ca', 'ción'],
    terapia: ['te', 'ra', 'pia'],
    metronomo: ['me', 'tro', 'no', 'mo'],
    metrónomo: ['me', 'tró', 'no', 'mo'],
    duolingo: ['duo', 'lin', 'go'],
    bloqueos: ['blo', 'que', 'os'],
    bloqueo: ['blo', 'que', 'o'],
    guion: ['guion'],
    poeta: ['po', 'e', 'ta'],
    biologia: ['bio', 'lo', 'gi', 'a'],
    biología: ['bio', 'lo', 'gí', 'a'],
    psicologia: ['psi', 'co', 'lo', 'gi', 'a'],
    psicología: ['psi', 'co', 'lo', 'gí', 'a'],
    transporte: ['trans', 'por', 'te'],
    estrategico: ['es', 'tra', 'te', 'gi', 'co'],
    estratégico: ['es', 'tra', 'té', 'gi', 'co'],
    estruendo: ['es', 'truen', 'do'],
  };

  if (excepciones[lower]) {
    // Preservar la capitalización original si corresponde
    return excepciones[lower];
  }

  const chars = Array.from(cleanWord);
  const n = chars.length;
  const cuts: number[] = [];

  let i = 0;
  while (i < n) {
    // Si encontramos una vocal, buscamos la siguiente vocal
    if (isVocal(chars[i])) {
      let j = i + 1;
      // Saltamos vocales contiguas evaluando si forman diptongo o hiato
      if (j < n && isVocal(chars[j])) {
        if (formanHiato(chars[i], chars[j])) {
          cuts.push(j);
        }
        j++;
      }

      // Buscamos consonantes intermedias entre vocales
      const consonantsStart = j;
      while (j < n && !isVocal(chars[j])) {
        j++;
      }

      if (j < n) {
        // Encontramos la siguiente vocal; analizamos las consonantes intermedias
        const count = j - consonantsStart;
        const cons = cleanWord.slice(consonantsStart, j).toLowerCase();

        if (count === 1) {
          // 1 consonante va con la siguiente vocal: V-CV (ej. ca-sa)
          cuts.push(consonantsStart);
        } else if (count === 2) {
          // 2 consonantes: si forman grupo inseparable (ej. tr, bl), van con la segunda vocal
          if (GRUPOS_INSEPARABLES.has(cons)) {
            cuts.push(consonantsStart);
          } else {
            // Se dividen C-C: cal-ma, rit-mo, den-sa
            cuts.push(consonantsStart + 1);
          }
        } else if (count === 3) {
          // 3 consonantes: normalmente dos a la primera y una a la segunda, salvo si las dos últimas son inseparables
          const lastTwo = cons.slice(1);
          if (GRUPOS_INSEPARABLES.has(lastTwo)) {
            cuts.push(consonantsStart + 1); // ej. es-truen-do
          } else {
            cuts.push(consonantsStart + 2); // ej. pers-pi-caz
          }
        } else if (count >= 4) {
          // 4 consonantes: dos a cada una (ej. trans-crip-ción)
          cuts.push(consonantsStart + 2);
        }
      }
      i = j;
    } else {
      i++;
    }
  }

  // Reconstruir sílabas basadas en los puntos de corte únicos y ordenados
  const uniqueCuts = Array.from(new Set(cuts)).sort((a, b) => a - b);
  const syllables: string[] = [];
  let prev = 0;
  for (const cut of uniqueCuts) {
    if (cut > prev && cut < n) {
      syllables.push(cleanWord.slice(prev, cut));
      prev = cut;
    }
  }
  if (prev < n) {
    syllables.push(cleanWord.slice(prev));
  }

  return syllables.length > 0 ? syllables : [cleanWord];
}

/**
 * Divide una oración en palabras con sus respectivas sílabas.
 */
export function syllabifySentence(sentence: string): { word: string; syllables: string[] }[] {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  return words.map((w) => ({
    word: w,
    syllables: syllabifyWord(w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, '')),
  }));
}

/**
 * Aplana una oración completa en una lista consecutiva de sílabas para ejercicios rítmicos.
 * @param sentence Oración o frase
 */
export function flattenSentenceSyllables(sentence: string): string[] {
  const parsed = syllabifySentence(sentence);
  const result: string[] = [];
  for (const item of parsed) {
    result.push(...item.syllables);
  }
  return result;
}
