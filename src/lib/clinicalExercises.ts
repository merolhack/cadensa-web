import { ExerciseRow } from './trainingService';

export type ClinicalCategory = 'fonetica_basica' | 'diadococinesia' | 'vocales' | 'frases_complejas';

export interface ClinicalExercise extends ExerciseRow {
  category: ClinicalCategory;
  clinicalObjective: string;
  targetPhonemes: string[];
}

export const EXPANDED_CLINICAL_CATALOG: ClinicalExercise[] = [
  // 1. Fonética Básica e Isocronía Introductoria (Visible inicialmente en 'Todas')
  {
    id: 'fon-1',
    category: 'fonetica_basica',
    difficulty: 'facil',
    phrase: 'Ca mi no des pa cio ca da ma ña na',
    bpm_recommended: 80,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Estabilización métrica silábica con ritmo isocrónico',
    targetPhonemes: ['/k/', '/m/', '/n/', '/d/', '/p/'],
  },
  {
    id: 'fon-2',
    category: 'fonetica_basica',
    difficulty: 'intermedio',
    phrase: 'El sol bri lla fuer te en el cie lo a zul',
    bpm_recommended: 85,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Respiración diafragmática coordinada en oraciones estándar',
    targetPhonemes: ['/l/', '/s/', '/br/', '/f/'],
  },

  // 2. Diadococinesia Oral (Repetición motora alternante rápida)
  {
    id: 'ddk-1',
    category: 'diadococinesia',
    difficulty: 'facil',
    phrase: 'Pa ta ka pa ta ka pa ta ka',
    bpm_recommended: 75,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Coordinación motriz velo-lingual y labial anteroposterior',
    targetPhonemes: ['/p/', '/t/', '/k/'],
  },
  {
    id: 'ddk-2',
    category: 'diadococinesia',
    difficulty: 'intermedio',
    phrase: 'Ba da ga ba da ga ba da ga',
    bpm_recommended: 80,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Control del punto de articulación sonoro y resonancia velar',
    targetPhonemes: ['/b/', '/d/', '/g/'],
  },
  {
    id: 'ddk-3',
    category: 'diadococinesia',
    difficulty: 'avanzado',
    phrase: 'Tra kla pra tra kla pra tra kla',
    bpm_recommended: 90,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Agilidad en grupos consonánticos complejos y trabadas',
    targetPhonemes: ['/tr/', '/kl/', '/pr/'],
  },

  // 3. Vocales y Fonación Continua (Reducción de tensión laríngea)
  {
    id: 'voc-1',
    category: 'vocales',
    difficulty: 'facil',
    phrase: 'A e i o u a e i o u',
    bpm_recommended: 70,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Apertura glótica estable y fonación continua sin bloqueos',
    targetPhonemes: ['/a/', '/e/', '/i/', '/o/', '/u/'],
  },
  {
    id: 'voc-2',
    category: 'vocales',
    difficulty: 'intermedio',
    phrase: 'Ma me mi mo mu sa se si so su',
    bpm_recommended: 75,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Transición suave de ataque consonántico nasal y fricativo a vocal',
    targetPhonemes: ['/m/', '/s/'],
  },

  // 4. Frases Complejas (Velocidad y polisílabos articulados)
  {
    id: 'cmp-1',
    category: 'frases_complejas',
    difficulty: 'intermedio',
    phrase: 'La res pi ra cion tran qui la li be ra la ten sion',
    bpm_recommended: 90,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Generalización de la fluidez en frases polisilábicas compuestas',
    targetPhonemes: ['/r/', '/sp/', '/tr/', '/b/'],
  },
  {
    id: 'cmp-2',
    category: 'frases_complejas',
    difficulty: 'avanzado',
    phrase: 'El cons tan te mo vi mien to au men ta la flui dez',
    bpm_recommended: 95,
    created_at: new Date().toISOString(),
    clinicalObjective: 'Automatización neuromotora del tempo en habla continua',
    targetPhonemes: ['/kst/', '/m/', '/v/', '/fl/'],
  },
];

export function getExercisesByCategory(category?: ClinicalCategory): ClinicalExercise[] {
  if (!category) return EXPANDED_CLINICAL_CATALOG;
  return EXPANDED_CLINICAL_CATALOG.filter((ex) => ex.category === category);
}

export function getExerciseById(id: string): ClinicalExercise | undefined {
  return EXPANDED_CLINICAL_CATALOG.find((ex) => ex.id === id);
}
