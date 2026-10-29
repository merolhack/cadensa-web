import { describe, it, expect } from 'vitest';
import {
  PEDIATRIC_AVATARS,
  PEDIATRIC_CHALLENGES,
  calculatePediatricReward,
  playKidsSyllableTone,
  playKidsFanfare,
} from './pediatricFluency';

describe('pediatricFluency engine', () => {
  it('debe contener los 3 avatares fonoaudiológicos infantiles', () => {
    expect(PEDIATRIC_AVATARS.tortuga).toBeDefined();
    expect(PEDIATRIC_AVATARS.castor).toBeDefined();
    expect(PEDIATRIC_AVATARS.colibri).toBeDefined();
    expect(PEDIATRIC_AVATARS.tortuga.recommendedBpm).toBe(60);
    expect(PEDIATRIC_AVATARS.castor.recommendedBpm).toBe(70);
    expect(PEDIATRIC_AVATARS.colibri.recommendedBpm).toBe(75);
  });

  it('debe tener frases infantiles con contextos lúdicos expandidos y metas emoji', () => {
    expect(PEDIATRIC_CHALLENGES.length).toBeGreaterThanOrEqual(6);
    expect(PEDIATRIC_CHALLENGES[0].phrase).toContain('miel');
    expect(PEDIATRIC_CHALLENGES[0].goalEmoji).toBe('🍯');
    expect(PEDIATRIC_CHALLENGES[4].funContext).toContain('delfín');
  });

  it('debe calcular recompensas de 3 estrellas para alta precisión', () => {
    const reward = calculatePediatricReward(90);
    expect(reward.stars).toBe(3);
    expect(reward.magicPoints).toBe(30);
    expect(reward.cheerMessage).toContain('¡Increíble!');
  });

  it('debe otorgar 2 o 1 estrella de forma motivacional ante precisiones moderadas', () => {
    const reward2 = calculatePediatricReward(70);
    expect(reward2.stars).toBe(2);

    const reward1 = calculatePediatricReward(50);
    expect(reward1.stars).toBe(1);
    expect(reward1.cheerMessage).toContain('Tortuga Zen');
  });

  it('debe ejecutar los helpers de audio sin fallar en entornos sin Web Audio nativo', () => {
    expect(() => playKidsSyllableTone(0)).not.toThrow();
    expect(() => playKidsSyllableTone(3)).not.toThrow();
    expect(() => playKidsFanfare()).not.toThrow();
  });
});
