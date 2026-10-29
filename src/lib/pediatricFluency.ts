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

export const PEDIATRIC_AVATARS: Record<'tortuga' | 'castor' | 'colibri', PediatricAvatar> = {
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
  goalEmoji: string;
  difficulty: 'fácil' | 'divertido';
}

export const PEDIATRIC_CHALLENGES: PediatricChallenge[] = [
  {
    id: 'ped-1',
    phrase: 'El o so co me miel en el bos que',
    syllablesCount: 10,
    funContext: '🐻 Ayuda al oso a buscar su merienda',
    goalEmoji: '🍯',
    difficulty: 'fácil',
  },
  {
    id: 'ped-2',
    phrase: 'Mi pe rro sal ta al to en el par que',
    syllablesCount: 10,
    funContext: '🐶 Juega a atrapar la pelota en el césped',
    goalEmoji: '🎾',
    difficulty: 'fácil',
  },
  {
    id: 'ped-3',
    phrase: 'La lu na bri lla sua ve en la no che',
    syllablesCount: 10,
    funContext: '🌙 Un cuento tranquilo antes de dormir',
    goalEmoji: '⭐',
    difficulty: 'divertido',
  },
  {
    id: 'ped-4',
    phrase: 'El tren via ja por las mon ta ñas',
    syllablesCount: 9,
    funContext: '🚂 ¡Chu-chu! El tren avanza a compás',
    goalEmoji: '🚩',
    difficulty: 'divertido',
  },
  {
    id: 'ped-5',
    phrase: 'El del fín na da fe liz en el mar',
    syllablesCount: 10,
    funContext: '🐬 El delfín salta sobre las olas azules',
    goalEmoji: '🌊',
    difficulty: 'fácil',
  },
  {
    id: 'ped-6',
    phrase: 'La ma ri po sa vue la en el jar dín',
    syllablesCount: 11,
    funContext: '🦋 La mariposa visita las flores mágicas',
    goalEmoji: '🌸',
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

/**
 * Reproduce un tono amable de campana o marimba para acompañar cada sílaba.
 * Seguro para entornos sin Web Audio o tests en node/jsdom.
 */
let sharedKidsAudioCtx: AudioContext | null = null;

export function playKidsSyllableTone(stepIndex = 0): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedKidsAudioCtx || sharedKidsAudioCtx.state === 'closed') {
      sharedKidsAudioCtx = new AudioContextClass();
    }
    if (sharedKidsAudioCtx.state === 'suspended') {
      sharedKidsAudioCtx.resume().catch(() => {});
    }

    // Escala pentatónica agradable (C5, D5, E5, G5, A5)
    const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = pentatonicNotes[stepIndex % pentatonicNotes.length];

    const now = sharedKidsAudioCtx.currentTime;
    const osc = sharedKidsAudioCtx.createOscillator();
    const gain = sharedKidsAudioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Envolvente de campana suave
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(sharedKidsAudioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Falla silenciosa si el audio está bloqueado por el navegador
  }
}

/**
 * Fanfarria de victoria fonoaudiológica para premiar al niño.
 */
export function playKidsFanfare(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedKidsAudioCtx || sharedKidsAudioCtx.state === 'closed') {
      sharedKidsAudioCtx = new AudioContextClass();
    }
    if (sharedKidsAudioCtx.state === 'suspended') {
      sharedKidsAudioCtx.resume().catch(() => {});
    }

    const victoryNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = sharedKidsAudioCtx.currentTime;

    victoryNotes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.12;
      const osc = sharedKidsAudioCtx!.createOscillator();
      const gain = sharedKidsAudioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.18, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(sharedKidsAudioCtx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  } catch {
    // Falla silenciosa
  }
}

/**
 * Síntesis de sonido de aplauso motivacional para el Modo Dúo (Familia / Fonoaudiólogo).
 */
export function playKidsApplauseSound(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedKidsAudioCtx || sharedKidsAudioCtx.state === 'closed') {
      sharedKidsAudioCtx = new AudioContextClass();
    }
    if (sharedKidsAudioCtx.state === 'suspended') {
      sharedKidsAudioCtx.resume().catch(() => {});
    }

    const now = sharedKidsAudioCtx.currentTime;
    const claps = [0, 0.08, 0.16];

    claps.forEach((offset) => {
      const clapTime = now + offset;
      const osc = sharedKidsAudioCtx!.createOscillator();
      const gain = sharedKidsAudioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, clapTime);

      gain.gain.setValueAtTime(0.001, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.2, clapTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, clapTime + 0.07);

      osc.connect(gain);
      gain.connect(sharedKidsAudioCtx!.destination);

      osc.start(clapTime);
      osc.stop(clapTime + 0.08);
    });
  } catch {
    // Falla silenciosa
  }
}

