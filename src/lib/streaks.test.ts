import { describe, it, expect } from 'vitest';
import {
  calculateSessionXP,
  getUserLevelTitle,
  evaluateUserBadges,
} from './streaks';

describe('Gamification & Streaks Engine - Unit Tests', () => {
  describe('calculateSessionXP', () => {
    it('debe calcular XP proporcional a la duración y precisión', () => {
      // 2 minutos (120s) a 100% de precisión: 2 * 25 * 1.0 = 50 XP
      expect(calculateSessionXP(120, 100)).toBe(50);

      // 1 minuto (60s) a 80% de precisión: 1 * 25 * 0.8 = 20 XP
      expect(calculateSessionXP(60, 80)).toBe(20);
    });
  });

  describe('getUserLevelTitle', () => {
    it('debe asignar el título de nivel adecuado según los puntos XP', () => {
      expect(getUserLevelTitle(50)).toBe('Iniciado en Cadencia');
      expect(getUserLevelTitle(250)).toBe('Entrenador Constante');
      expect(getUserLevelTitle(600)).toBe('Hablante Fluido');
      expect(getUserLevelTitle(1200)).toBe('Maestro del Ritmo');
    });
  });

  describe('evaluateUserBadges', () => {
    it('debe desbloquear insignias según los días de racha y minutos', () => {
      const badgesNew = evaluateUserBadges(0, 0);
      expect(badgesNew.every((b) => !b.unlocked)).toBe(true);

      const badgesActive = evaluateUserBadges(4, 35);
      const firstBeat = badgesActive.find((b) => b.id === 'first_beat');
      const streak3 = badgesActive.find((b) => b.id === 'streak_3');
      const master30 = badgesActive.find((b) => b.id === 'master_30m');

      expect(firstBeat?.unlocked).toBe(true);
      expect(streak3?.unlocked).toBe(true);
      expect(master30?.unlocked).toBe(true);
    });
  });
});
