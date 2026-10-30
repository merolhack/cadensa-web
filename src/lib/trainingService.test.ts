import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateDailyStreak,
  recordTrainingSession,
  claimLocalSessions,
  getExerciseCatalog,
  FALLBACK_EXERCISES,
} from './trainingService';

describe('TrainingService - Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage mock
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('evaluateDailyStreak', () => {
    it('debe iniciar la racha en 1 si es la primera sesión registrada', () => {
      const result = evaluateDailyStreak(null);
      expect(result.newStreak).toBe(1);
      expect(result.shouldIncrement).toBe(true);
      expect(result.wasReset).toBe(false);
    });

    it('no debe incrementar racha si ya entrenó hoy', () => {
      const today = new Date();
      const result = evaluateDailyStreak(today.toISOString(), today);
      expect(result.shouldIncrement).toBe(false);
      expect(result.wasReset).toBe(false);
    });

    it('debe incrementar racha si el último entrenamiento fue ayer', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = evaluateDailyStreak(yesterday.toISOString(), new Date());
      expect(result.newStreak).toBe(2);
      expect(result.shouldIncrement).toBe(true);
      expect(result.wasReset).toBe(false);
    });

    it('debe reiniciar racha a 1 si pasaron 2 o más días sin entrenar', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = evaluateDailyStreak(threeDaysAgo.toISOString(), new Date());
      expect(result.newStreak).toBe(1);
      expect(result.wasReset).toBe(true);
    });
  });

  describe('recordTrainingSession', () => {
    it('debe almacenar la sesión en localStorage para soporte offline', async () => {
      const session = {
        bpm: 80,
        durationSeconds: 120,
        syllableCount: 15,
        accuracyScore: 95.5,
        exercisePhrase: 'Cadensa entrena tu fluidez',
      };

      const result = await recordTrainingSession(session);
      expect(result.success).toBe(true);
      expect(result.offline).toBe(true);

      const stored = JSON.parse(localStorage.getItem('cadensa_sessions') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].bpm).toBe(80);
      expect(stored[0].syllableCount).toBe(15);
    });
  });

  describe('claimLocalSessions', () => {
    it('no debe hacer nada si userId está vacío o es local_guest', async () => {
      const res1 = await claimLocalSessions('');
      expect(res1.claimedCount).toBe(0);
      expect(res1.success).toBe(true);

      const res2 = await claimLocalSessions('local_guest');
      expect(res2.claimedCount).toBe(0);
      expect(res2.success).toBe(true);
    });

    it('adopta sesiones locales huérfanas y las asocia al userId autenticado', async () => {
      const guestSessions = [
        {
          id: 's1',
          bpm: 75,
          durationSeconds: 60,
          syllableCount: 10,
          accuracyScore: 90,
          userId: 'local_guest',
        },
        {
          id: 's2',
          bpm: 80,
          durationSeconds: 120,
          syllableCount: 20,
          accuracyScore: 95,
        },
      ];
      localStorage.setItem('cadensa_sessions', JSON.stringify(guestSessions));

      const mockClient = {
        from: () => ({
          insert: async () => ({ error: null }),
        }),
      };

      const result = await claimLocalSessions('11111111-2222-3333-4444-555555555555', mockClient as never);
      expect(result.success).toBe(true);
      expect(result.claimedCount).toBe(2);

      const updated = JSON.parse(localStorage.getItem('cadensa_sessions') || '[]');
      expect(updated[0].userId).toBe('11111111-2222-3333-4444-555555555555');
      expect(updated[1].userId).toBe('11111111-2222-3333-4444-555555555555');
    });
  });

  describe('getExerciseCatalog', () => {
    it('debe retornar el catálogo fallback de ejercicios clínicos en caso de error o sin conexión', async () => {
      const catalog = await getExerciseCatalog();
      expect(catalog.length).toBeGreaterThanOrEqual(FALLBACK_EXERCISES.length);
      expect(catalog[0].phrase).toBe('Encuentra el ritmo de tu voz');
    });
  });
});
