import { describe, it, expect } from 'vitest';
import {
  isVocal,
  formanHiato,
  syllabifyWord,
  syllabifySentence,
  flattenSentenceSyllables,
} from './syllables';

describe('Spanish Syllabifier Engine - Unit Tests', () => {
  describe('isVocal', () => {
    it('debe reconocer vocales abiertas y cerradas, acentuadas o no', () => {
      expect(isVocal('a')).toBe(true);
      expect(isVocal('E')).toBe(true);
      expect(isVocal('í')).toBe(true);
      expect(isVocal('ó')).toBe(true);
      expect(isVocal('ü')).toBe(true);
      expect(isVocal('b')).toBe(false);
      expect(isVocal('z')).toBe(false);
    });
  });

  describe('formanHiato', () => {
    it('debe detectar hiato entre dos vocales abiertas', () => {
      expect(formanHiato('o', 'e')).toBe(true); // po-e-ta
      expect(formanHiato('a', 'o')).toBe(true); // ca-os
    });

    it('debe detectar hiato entre vocal abierta y cerrada tónica acentuada', () => {
      expect(formanHiato('a', 'í')).toBe(true); // pa-ís
      expect(formanHiato('í', 'a')).toBe(true); // dí-a
    });

    it('debe reconocer diptongos (no hiato)', () => {
      expect(formanHiato('i', 'a')).toBe(false); // ca-den-cia
      expect(formanHiato('u', 'e')).toBe(false); // bue-no
    });
  });

  describe('syllabifyWord - Casos de prueba generados por ollama-local', () => {
    const testCases = [
      { word: 'cadencia', expected: ['ca', 'den', 'cia'] },
      { word: 'ritmo', expected: ['rit', 'mo'] },
      { word: 'comunicación', expected: ['co', 'mu', 'ni', 'ca', 'ción'] },
      { word: 'estruendo', expected: ['es', 'truen', 'do'] },
      { word: 'poeta', expected: ['po', 'e', 'ta'] },
      { word: 'transporte', expected: ['trans', 'por', 'te'] },
      { word: 'guion', expected: ['guion'] },
      { word: 'biología', expected: ['bio', 'lo', 'gí', 'a'] },
      { word: 'psicología', expected: ['psi', 'co', 'lo', 'gí', 'a'] },
      { word: 'estratégico', expected: ['es', 'tra', 'té', 'gi', 'co'] },
    ];

    testCases.forEach(({ word, expected }) => {
      it(`debe separar correctamente "${word}" en ${JSON.stringify(expected)}`, () => {
        expect(syllabifyWord(word)).toEqual(expected);
      });
    });
  });

  describe('syllabifySentence & flattenSentenceSyllables', () => {
    it('debe estructurar una frase completa en palabras y sílabas', () => {
      const sentence = 'Encuentra el ritmo de tu voz';
      const result = syllabifySentence(sentence);

      expect(result.length).toBe(6);
      expect(result[0].word).toBe('Encuentra');
      expect(result[2].word).toBe('ritmo');
      expect(result[2].syllables).toEqual(['rit', 'mo']);
    });

    it('debe aplanar una frase en un flujo continuo de sílabas para el metrónomo', () => {
      const sentence = 'Cadensa es ritmo';
      const syllables = flattenSentenceSyllables(sentence);

      expect(syllables).toEqual(['ca', 'den', 'sa', 'es', 'rit', 'mo']);
      expect(syllables.length).toBe(6);
    });
  });
});
