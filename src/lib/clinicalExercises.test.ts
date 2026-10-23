import { describe, it, expect } from 'vitest';
import {
  EXPANDED_CLINICAL_CATALOG,
  getExercisesByCategory,
  getExerciseById,
} from './clinicalExercises';

describe('clinicalExercises catalog', () => {
  it('contiene ejercicios clínicos predefinidos con objetivos y fonemas diana', () => {
    expect(EXPANDED_CLINICAL_CATALOG.length).toBeGreaterThanOrEqual(8);
    for (const ex of EXPANDED_CLINICAL_CATALOG) {
      expect(ex.id).toBeTruthy();
      expect(ex.phrase).toBeTruthy();
      expect(ex.clinicalObjective).toBeTruthy();
      expect(ex.targetPhonemes.length).toBeGreaterThan(0);
      expect(ex.bpm_recommended).toBeGreaterThanOrEqual(60);
      expect(ex.bpm_recommended).toBeLessThanOrEqual(120);
    }
  });

  it('permite filtrar ejercicios por categoría clínica', () => {
    const ddk = getExercisesByCategory('diadococinesia');
    expect(ddk.length).toBeGreaterThanOrEqual(3);
    expect(ddk.every((ex) => ex.category === 'diadococinesia')).toBe(true);

    const vocales = getExercisesByCategory('vocales');
    expect(vocales.length).toBeGreaterThanOrEqual(2);
    expect(vocales.every((ex) => ex.category === 'vocales')).toBe(true);

    const todos = getExercisesByCategory();
    expect(todos.length).toBe(EXPANDED_CLINICAL_CATALOG.length);
  });

  it('permite recuperar un ejercicio por su identificador único', () => {
    const ex = getExerciseById('ddk-1');
    expect(ex).toBeDefined();
    expect(ex?.phrase).toContain('Pa ta ka');
    expect(ex?.targetPhonemes).toEqual(['/p/', '/t/', '/k/']);

    const inexistente = getExerciseById('no-existe');
    expect(inexistente).toBeUndefined();
  });
});
