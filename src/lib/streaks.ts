/**
 * Cadensa Gamification & Badges Engine
 * Sistema de puntos de experiencia (XP), niveles de fluidez y logros clínicos.
 */

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface UserStats {
  currentStreak: number;
  totalMinutes: number;
  xpPoints: number;
  averageAccuracy: number;
  levelTitle: string;
}

/**
 * Calcula los puntos de experiencia (XP) ganados en una sesión.
 */
export function calculateSessionXP(durationSeconds: number, accuracyScore: number): number {
  const baseMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const accuracyMultiplier = Math.max(0.5, accuracyScore / 100);
  return Math.round(baseMinutes * 25 * accuracyMultiplier);
}

/**
 * Determina el título de nivel del usuario según sus puntos de experiencia.
 */
export function getUserLevelTitle(xp: number): string {
  if (xp >= 1000) return 'Maestro del Ritmo';
  if (xp >= 500) return 'Hablante Fluido';
  if (xp >= 200) return 'Entrenador Constante';
  return 'Iniciado en Cadencia';
}

/**
 * Evalúa los logros e insignias clínicas desbloqueadas por el usuario.
 */
export function evaluateUserBadges(streakDays: number, totalMinutes: number): Badge[] {
  return [
    {
      id: 'first_beat',
      title: 'Primer Pulso',
      description: 'Completaste tu primera sesión de entrenamiento.',
      icon: '🎵',
      unlocked: totalMinutes > 0,
    },
    {
      id: 'streak_3',
      title: 'Hábito en Marcha',
      description: '3 días consecutivos de práctica rítmica.',
      icon: '🔥',
      unlocked: streakDays >= 3,
    },
    {
      id: 'streak_7',
      title: 'Constancia de Acero',
      description: '7 días de racha ininterrumpida.',
      icon: '⚡',
      unlocked: streakDays >= 7,
    },
    {
      id: 'master_30m',
      title: 'Neuroplasticidad Activa',
      description: 'Acumulaste 30 minutos de habla silábica.',
      icon: '🧠',
      unlocked: totalMinutes >= 30,
    },
  ];
}
