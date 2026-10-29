/**
 * Cadensa Pediatric Fluency Gamification Engine
 * Dinámicas lúdicas y fonoaudiológicas adaptadas para disfemia infantil temprana (4 a 10 años).
 * Aplica principios de habla suave (Turtle Speech) y refuerzo positivo con avatares.
 */

export interface PediatricAvatar {
  id: 'tortuga' | 'castor' | 'colibri';
  name: string;
  animal: string;
  icon: string;
  motto: string;
  recommendedBpm: number;
}

export const PEDIATRIC_AVATARS: Record<string, PediatricAvatar> = {
  tortuga: {
    id: 'tortuga',
    name: 'Tortuga Zen',
    animal: 'Tortuga',
    icon: '🐢',
    motto: 'Habla despacito y con calma, paso a pasito.',
    recommendedBpm: 60,
  },
  castor: {
    id: 'castor',
    name: 'Cadensín el Castor',
    animal: 'Castor',
    icon: '🦫',
    motto: '¡Toc, toc! Construyamos el ritmo con cada sílaba.',
    recommendedBpm: 70,
  },
  colibri: {
    id: 'colibri',
    name: 'Colibrí Cantor',
    animal: 'Colibrí',
    icon: '🐦',
    motto: 'Voz suave como una pluma, sin apretar.',
    recommendedBpm: 75,
  },
};

export interface PediatricChallenge {
  id: string;
  phrase: string;
  syllablesCount: number;
  funContext: string;
  difficulty: 'fácil' | 'divertido';
}

export const PEDIATRIC_CHALLENGES: PediatricChallenge[] = [
  {
    id: 'ped-1',
    phrase: 'El o so co me miel en el bos que',
    syllablesCount: 9,
    funContext: '🐻 Ayuda al oso a buscar su merienda',
    difficulty: 'fácil',
  },
  {
    id: 'ped-2',
    phrase: 'Mi pe rro sal ta al to en el par que',
    syllablesCount: 10,
    funContext: '🐶 Juega a atrapar la pelota en el césped',
    difficulty: 'fácil',
  },
  {
    id: 'ped-3',
    phrase: 'La lu na bri lla sua ve en la no che',
    syllablesCount: 10,
    funContext: '🌙 Un cuento tranquilo antes de dormir',
    difficulty: 'divertido',
  },
  {
    id: 'ped-4',
    phrase: 'El tren via ja por las mon ta ñas al tas',
    syllablesCount: 11,
    funContext: '🚂 ¡Chu-chu! El tren avanza a compás',
    difficulty: 'divertido',
  },
];

/**
 * Calcula las estrellas ganadas (1 a 3) y puntos mágicos por sesión infantil.
 */
export function calculatePediatricReward(accuracyPercentage: number): {
  stars: number;
  magicPoints: number;
  cheerMessage: string;
} {
  if (accuracyPercentage >= 85) {
    return {
      stars: 3,
      magicPoints: 30,
      cheerMessage: '¡Increíble! ¡Hablaste suave y al ritmo perfecto!',
    };
  }
  if (accuracyPercentage >= 65) {
    return {
      stars: 2,
      magicPoints: 20,
      cheerMessage: '¡Muy bien hecho! Cada día tu voz tiene más ritmo.',
    };
  }
  return {
    stars: 1,
    magicPoints: 10,
    cheerMessage: '¡Buen intento! Recuerda respirar como la Tortuga Zen.',
  };
}
