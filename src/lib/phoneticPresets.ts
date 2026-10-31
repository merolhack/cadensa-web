export interface VowelFormants {
  a: { f1: number; f2: number };
  e: { f1: number; f2: number };
  i: { f1: number; f2: number };
  o: { f1: number; f2: number };
  u: { f1: number; f2: number };
}

export interface DialectPreset {
  id: string;
  name: string;
  region: string;
  flag: string;
  recommendedTempoBpm: number;
  syllablesPerSecond: number;
  description: string;
  clinicalConsiderations: string;
  vowelFormants: VowelFormants;
}

export const DIALECT_PRESETS: Record<string, DialectPreset> = {
  mexico_central: {
    id: 'mexico_central',
    name: 'Español Mexicano Central',
    region: 'México',
    flag: '🇲🇽',
    recommendedTempoBpm: 80,
    syllablesPerSecond: 4.8,
    description: 'Articulación clara y equilibrada con conservación consonántica.',
    clinicalConsiderations: 'Ideal para inicio en metrónomo isocrónico (75 a 85 BPM).',
    vowelFormants: {
      a: { f1: 750, f2: 1200 },
      e: { f1: 500, f2: 1900 },
      i: { f1: 300, f2: 2300 },
      o: { f1: 450, f2: 900 },
      u: { f1: 300, f2: 800 },
    },
  },
  cono_sur: {
    id: 'cono_sur',
    name: 'Español Rioplatense / Cono Sur',
    region: 'Argentina / Uruguay / Chile',
    flag: '🇦🇷',
    recommendedTempoBpm: 78,
    syllablesPerSecond: 4.5,
    description: 'Cadencia melódica con alargamiento vocálico tónico característico.',
    clinicalConsiderations: 'Aprovechar la musicalidad prosódica para suavizar ataques vocales.',
    vowelFormants: {
      a: { f1: 800, f2: 1100 },
      e: { f1: 520, f2: 1800 },
      i: { f1: 280, f2: 2200 },
      o: { f1: 420, f2: 850 },
      u: { f1: 310, f2: 750 },
    },
  },
  andino: {
    id: 'andino',
    name: 'Español Andino',
    region: 'Perú / Bolivia / Ecuador',
    flag: '🇵🇪',
    recommendedTempoBpm: 74,
    syllablesPerSecond: 4.2,
    description: 'Tempo más pausado y vocalismo tensado sin elisiones.',
    clinicalConsiderations: 'Facilita la sincronización estricta de sílaba por pulso (isocronía).',
    vowelFormants: {
      a: { f1: 720, f2: 1300 },
      e: { f1: 480, f2: 2000 },
      i: { f1: 320, f2: 2400 },
      o: { f1: 480, f2: 950 },
      u: { f1: 350, f2: 850 },
    },
  },
  caribe: {
    id: 'caribe',
    name: 'Español Caribeño',
    region: 'Caribe / Colombia Norte / Venezuela',
    flag: '🇨🇺',
    recommendedTempoBpm: 86,
    syllablesPerSecond: 5.4,
    description: 'Ritmo rápido con aspiración de consonantes implosivas.',
    clinicalConsiderations: 'Requiere regular la tasa de emisión para evitar anticipación de bloqueos.',
    vowelFormants: {
      a: { f1: 820, f2: 1150 },
      e: { f1: 550, f2: 1700 },
      i: { f1: 250, f2: 2100 },
      o: { f1: 400, f2: 800 },
      u: { f1: 320, f2: 700 },
    },
  },
  iberico: {
    id: 'iberico',
    name: 'Castellano Peninsular',
    region: 'España',
    flag: '🇪🇸',
    recommendedTempoBpm: 80,
    syllablesPerSecond: 5.0,
    description: 'Distinción fonológica interdental /θ/ y firmeza articulatoria.',
    clinicalConsiderations: 'Vigilar el contacto articular ligero en oclusivas (/p/, /t/, /k/).',
    vowelFormants: {
      a: { f1: 780, f2: 1250 },
      e: { f1: 490, f2: 1950 },
      i: { f1: 290, f2: 2350 },
      o: { f1: 440, f2: 920 },
      u: { f1: 300, f2: 820 },
    },
  },
};

export function getDialectPreset(id: string): DialectPreset {
  return DIALECT_PRESETS[id] || DIALECT_PRESETS['mexico_central'];
}
