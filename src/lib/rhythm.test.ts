import { describe, it, expect } from 'vitest';
import {
  calculateBeatIntervalMs,
  calculateSequenceDurationMs,
  isClinicallyRecommendedBpm,
} from './rhythm';

describe('Rhythm Utilities - Unit Tests', () => {
  describe('calculateBeatIntervalMs', () => {
    it('debe calcular correctamente 1000ms para 60 BPM', () => {
      expect(calculateBeatIntervalMs(60)).toBe(1000);
    });

    it('debe calcular correctamente 500ms para 120 BPM', () => {
      expect(calculateBeatIntervalMs(120)).toBe(500);
    });

    it('debe calcular aproximadamente 667ms para 90 BPM', () => {
      expect(calculateBeatIntervalMs(90)).toBe(667);
    });

    it('debe lanzar un error si el BPM es menor o igual a cero', () => {
      expect(() => calculateBeatIntervalMs(0)).toThrow('El valor de BPM debe ser mayor a 0');
      expect(() => calculateBeatIntervalMs(-10)).toThrow('El valor de BPM debe ser mayor a 0');
    });
  });

  describe('calculateSequenceDurationMs', () => {
    it('debe multiplicar correctamente el intervalo por el conteo de sílabas', () => {
      // 60 BPM -> 1000ms por sílaba * 4 sílabas = 4000ms
      expect(calculateSequenceDurationMs(60, 4)).toBe(4000);
    });

    it('debe retornar 0 si el conteo de sílabas es 0', () => {
      expect(calculateSequenceDurationMs(120, 0)).toBe(0);
    });

    it('debe lanzar error si el conteo de sílabas es negativo', () => {
      expect(() => calculateSequenceDurationMs(60, -2)).toThrow(
        'El conteo de sílabas no puede ser negativo'
      );
    });
  });

  describe('isClinicallyRecommendedBpm', () => {
    it('debe retornar true para valores dentro del rango terapéutico (60-160)', () => {
      expect(isClinicallyRecommendedBpm(60)).toBe(true);
      expect(isClinicallyRecommendedBpm(100)).toBe(true);
      expect(isClinicallyRecommendedBpm(160)).toBe(true);
    });

    it('debe retornar false para valores fuera del rango clínico', () => {
      expect(isClinicallyRecommendedBpm(40)).toBe(false);
      expect(isClinicallyRecommendedBpm(180)).toBe(false);
    });
  });
});
