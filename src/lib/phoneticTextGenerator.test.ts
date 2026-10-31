import { describe, it, expect } from 'vitest';
import {
  countSpanishSyllables,
  analyzePhoneticComplexity,
  generatePhoneticExercises,
} from './phoneticTextGenerator';

describe('phoneticTextGenerator - Client-Side NLP Engine', () => {
  it('cuenta correctamente las sílabas aproximadas en español', () => {
    expect(countSpanishSyllables('cadensa')).toBeGreaterThanOrEqual(3);
    expect(countSpanishSyllables('hola mundo')).toBeGreaterThanOrEqual(4);
    expect(countSpanishSyllables('pa')).toBe(1);
    expect(countSpanishSyllables('respiración diafragmática')).toBeGreaterThanOrEqual(7);
  });

  it('analiza la complejidad fonética y calcula densidad para oclusivas bilabiales', () => {
    const text = 'Pedro busca una manzana madura en el bosque.';
    const result = analyzePhoneticComplexity(text, 'bilabial_stops');

    expect(result.text).toBe(text);
    expect(result.targetGroup).toBe('bilabial_stops');
    expect(result.targetDensity).toBeGreaterThan(0);
    expect(result.difficultyScore).toBeGreaterThan(0);
    expect(result.recommendedTechnique).toBe('Contacto Articulador Ligero');
    expect(result.recommendedBpm).toBe(75);
  });

  it('recomienda Inicio Suave para inicios vocálicos', () => {
    const text = 'Ángel admira el amplio horizonte azul desde el árbol.';
    const result = analyzePhoneticComplexity(text, 'vowel_onsets');

    expect(result.recommendedTechnique).toBe('Inicio Suave (Easy Onset)');
    expect(result.recommendedBpm).toBe(65);
  });

  it('genera ejercicios filtrados por dialecto y nivel', () => {
    const exercisesMx = generatePhoneticExercises({
      level: 'sentences',
      targetGroup: 'bilabial_stops',
      dialectId: 'mx_central',
      count: 2,
    });

    expect(exercisesMx.length).toBeGreaterThan(0);
    expect(exercisesMx[0].dialectId).toBe('mx_central');
    expect(exercisesMx[0].level).toBe('sentences');
    expect(exercisesMx[0].tips).toBeDefined();

    const exercisesConoSur = generatePhoneticExercises({
      level: 'bisyllables',
      targetGroup: 'dental_stops',
      dialectId: 'cono_sur',
      count: 2,
    });

    expect(exercisesConoSur.length).toBeGreaterThan(0);
    expect(exercisesConoSur[0].targetGroup).toBe('dental_stops');
  });

  it('soporta niveles aislados, bisílabos, frases y prosa', () => {
    const isolated = generatePhoneticExercises({ level: 'isolated', count: 1 });
    const bisyllables = generatePhoneticExercises({ level: 'bisyllables', count: 1 });
    const sentences = generatePhoneticExercises({ level: 'sentences', count: 1 });
    const prose = generatePhoneticExercises({ level: 'prose', count: 1 });

    expect(isolated[0].level).toBe('isolated');
    expect(bisyllables[0].level).toBe('bisyllables');
    expect(sentences[0].level).toBe('sentences');
    expect(prose[0].level).toBe('prose');
  });
});
