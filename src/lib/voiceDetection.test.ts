import { describe, it, expect } from 'vitest';
import {
  evaluateRhythmicAccuracy,
  calculateAudioRMS,
  isVoiceActive,
} from './voiceDetection';

describe('Voice Detection & Accuracy - Unit Tests', () => {
  describe('evaluateRhythmicAccuracy', () => {
    it('debe calificar como "perfect" con 100 puntos si el desfase es menor o igual a 60ms', () => {
      const result = evaluateRhythmicAccuracy(1000, 1030); // 30ms de desfase
      expect(result.grade).toBe('perfect');
      expect(result.score).toBe(100);
      expect(result.diffMs).toBe(30);
    });

    it('debe calificar como "good" con 80 puntos si el desfase está entre 61ms y 120ms', () => {
      const result = evaluateRhythmicAccuracy(1000, 1090); // 90ms de desfase
      expect(result.grade).toBe('good');
      expect(result.score).toBe(80);
      expect(result.diffMs).toBe(90);
    });

    it('debe calificar como "miss" con 40 puntos si el desfase supera los 120ms', () => {
      const result = evaluateRhythmicAccuracy(1000, 1250); // 250ms de desfase
      expect(result.grade).toBe('miss');
      expect(result.score).toBe(40);
      expect(result.diffMs).toBe(250);
    });
  });

  describe('calculateAudioRMS & isVoiceActive', () => {
    it('debe retornar 0 para un buffer vacío', () => {
      expect(calculateAudioRMS(new Float32Array([]))).toBe(0);
    });

    it('debe calcular correctamente el RMS de muestras de onda', () => {
      const samples = new Float32Array([0.1, -0.1, 0.1, -0.1]);
      const rms = calculateAudioRMS(samples);
      expect(rms).toBeCloseTo(0.1, 3);
    });

    it('debe detectar actividad de voz si el RMS supera el umbral', () => {
      expect(isVoiceActive(0.08, 0.04)).toBe(true);
      expect(isVoiceActive(0.02, 0.04)).toBe(false);
    });
  });
});
