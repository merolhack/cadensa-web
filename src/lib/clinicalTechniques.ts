/**
 * Cadensa Clinical Techniques Catalog & Knowledge Engine
 * Modela el repertorio completo de intervenciones fonoaudiológicas basadas en evidencia:
 * Modelado de Fluidez (Fluency Shaping), Control Motor/Fisiológico y Modificación de Tartamudez (Van Riper).
 */

export type TechniqueFamilyId = 'fluency_shaping' | 'physiological' | 'stuttering_modification';

export type TechniqueId =
  | 'sts'
  | 'easy_onset'
  | 'light_contact'
  | 'prolonged_speech'
  | 'box_breathing'
  | 'pull_out'
  | 'cancellation';

export interface TechniqueFaqItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

import { ClinicalCategory } from './clinicalExercises';

export interface ClinicalTechnique {
  id: TechniqueId;
  familyId: TechniqueFamilyId;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  summary: string;
  clinicalObjective: string;
  neurobiologicalBasis: string;
  practicalSteps: string[];
  visualMode: 'metronome_beats' | 'smooth_ramp' | 'light_articulators' | 'vowel_elastic' | 'breathing_orb' | 'block_decompression';
  faqItems: TechniqueFaqItem[];
  isRhythmic: boolean;
  actionButton: {
    start: string;
    stop: string;
    icon: string;
  };
  exerciseGoal: string;
  recommendedCategory: ClinicalCategory | 'todas';
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface TechniqueFamily {
  id: TechniqueFamilyId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  techniques: TechniqueId[];
}

export const TECHNIQUE_FAMILIES: TechniqueFamily[] = [
  {
    id: 'fluency_shaping',
    name: 'Modelado de Fluidez (Fluency Shaping)',
    shortName: 'Fluency Shaping',
    description: 'Técnicas que reconfiguran el patrón articulatorio general para inducir un habla suave, isocrónica y continua.',
    icon: '🌊',
    techniques: ['sts', 'easy_onset', 'light_contact', 'prolonged_speech'],
  },
  {
    id: 'physiological',
    name: 'Control Motor y Fisiológico',
    shortName: 'Control Fisiológico',
    description: 'Optimización de la respiración diafragmática, flujo aéreo y disminución de la hipertonía neuromuscular.',
    icon: '🌬️',
    techniques: ['box_breathing'],
  },
  {
    id: 'stuttering_modification',
    name: 'Modificación del Bloqueo (Enfoque Van Riper)',
    shortName: 'Modificación Van Riper',
    description: 'Gestión consciente de la tensión durante o después del bloqueo para transformar el espasmo en fluidez.',
    icon: '🔄',
    techniques: ['pull_out', 'cancellation'],
  },
];

export const CLINICAL_TECHNIQUES: Record<TechniqueId, ClinicalTechnique> = {
  sts: {
    id: 'sts',
    familyId: 'fluency_shaping',
    name: 'Habla Rítmica Silábica (STS)',
    shortName: 'Ritmo STS',
    icon: '⏱️',
    badge: 'Isocronía',
    difficulty: 'Principiante',
    summary: 'Asigna a cada sílaba la misma duración temporal (isocronía) guiada por un pulso rítmico regular.',
    clinicalObjective: 'Eludir el déficit temporal biológico y reducir más del 70% de las disfluencias de forma inmediata.',
    neurobiologicalBasis: 'Cada sílaba recibe la misma duración temporal compensando el déficit de los ganglios basales.',
    practicalSteps: [
      'Configura un tempo cómodo (70 a 85 BPM).',
      'Inhala relajadamente desde el abdomen.',
      'Emite cada sílaba exactamente en sincronía con cada pulso o golpe de luz.',
      'Mantén el volumen uniforme sin enfatizar excesivamente ninguna sílaba.',
    ],
    visualMode: 'metronome_beats',
    faqItems: [
      {
        id: 'sts-1',
        question: '¿Por qué hablar con metrónomo reduce la tartamudez al instante?',
        answer: 'Porque el cerebro recibe un marcapasos neural externo alternativo. Al no tener que calcular la temporización motora internamente, las cuerdas vocales y la lengua no sufren espasmos ni bloqueos tónicos.',
        badge: 'Neurobiología',
      },
      {
        id: 'sts-2',
        question: '¿El objetivo es hablar como un robot en la vida real?',
        answer: 'No. El ritmo estricto se usa en la práctica para crear neuroplasticidad. Luego, mediante el reto de atenuación (Fading), aprendes a internalizar una cadencia serena y flexible que pasa desapercibida.',
        badge: 'Transferencia',
      },
      {
        id: 'sts-3',
        question: '¿A qué velocidad de BPM debo empezar?',
        answer: 'Recomendamos 70-80 BPM para principiantes. Conforme ganes confianza y cero bloqueos, puedes subir gradualmente a 90-110 BPM.',
        badge: 'Tempo',
      },
    ],
    isRhythmic: true,
    actionButton: {
      start: 'Comenzar Práctica Rítmica',
      stop: 'Pausar Ritmo STS',
      icon: '⏱️',
    },
    exerciseGoal: 'Marcapasos auditivo-motor con compás e isocronía regular',
    recommendedCategory: 'todas',
    videoUrl: '/media/techniques/cadensa_sts_montaje_limpio_final.mp4',
    thumbnailUrl: '/media/techniques/cadensa_sts_portada.png',
  },

  easy_onset: {
    id: 'easy_onset',
    familyId: 'fluency_shaping',
    name: 'Inicio Vocal Suave (Easy Onset)',
    shortName: 'Inicio Suave',
    icon: '🌊',
    badge: 'Ataque Glótico Suave',
    difficulty: 'Principiante',
    summary: 'Aspiración previa suave y aumento gradual de la sonoridad para evitar el ataque glótico duro y bloqueos en sonidos vocálicos.',
    clinicalObjective: 'Iniciar la fonación sin hipertonía ni espasmo aductor en las cuerdas vocales.',
    neurobiologicalBasis: 'Reduce la sobreactivación del músculo cricoaritenoideo lateral y tiroaritenoideo, facilitando una aproximación suave de los pliegues vocales con flujo aéreo continuo.',
    practicalSteps: [
      'Empieza con una suave exhalación silenciosa (como un suspiro tibio o una "h" casi inaudible).',
      'Permite que las cuerdas vocales empiecen a vibrar progresivamente (rampa de volumen: de 10% a 100%).',
      'Evita el choque violento o corte brusco en palabras que inician con vocal (ej. "Árbol", "Agua", "Hola").',
      'Sostén el flujo de aire continuo durante el resto de la palabra.',
    ],
    visualMode: 'smooth_ramp',
    faqItems: [
      {
        id: 'eo-1',
        question: '¿Qué es el "ataque glótico duro" y por qué bloquea la voz?',
        answer: 'Es el cierre hermético y tenso de las cuerdas vocales antes de que comience el aire. Al querer hablar, el aire choca con una pared muscular rígida, provocando el bloqueo silencioso o la fuerza en el cuello.',
        badge: 'Fisiología',
      },
      {
        id: 'eo-2',
        question: '¿Cómo se siente un Easy Onset correcto?',
        answer: 'Se siente como emitir un suspiro relajado donde el sonido vocal aparece de forma gradual, como encender una luz con dimmer en lugar de un interruptor seco.',
        badge: 'Sensación',
      },
      {
        id: 'eo-3',
        question: '¿En qué palabras es más útil el Inicio Vocal Suave?',
        answer: 'Esencial en palabras que empiezan con vocales abiertas (A, E, O) o consonantes sonoras (M, N, L), donde comúnmente se produce la anticipación y el cierre laringotraqueal.',
        badge: 'Aplicación',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Iniciar Rampa de Inicio Suave',
      stop: 'Pausar Rampa Vocal',
      icon: '🌊',
    },
    exerciseGoal: 'Aspiración silenciosa previa y ascenso gradual de sonoridad en vocales',
    recommendedCategory: 'vocales',
  },

  light_contact: {
    id: 'light_contact',
    familyId: 'fluency_shaping',
    name: 'Contacto Articular Suave (Light Contact)',
    shortName: 'Contacto Suave',
    icon: '🪶',
    badge: 'Contacto Articular Ligero',
    difficulty: 'Intermedio',
    summary: 'Aproximación mínima y rozamiento sutil de labios, lengua y dientes en consonantes de alta presión (/p/, /t/, /k/, /b/, /d/, /g/).',
    clinicalObjective: 'Eliminar la hiperpresión intrabucal y evitar que los articuladores se queden pegados por exceso de fuerza motriz.',
    neurobiologicalBasis: 'Regula el bucle sensorimotor trigeminal y facial, desensibilizando la tendencia a apretar los músculos orbicular de los labios y geniogloso.',
    practicalSteps: [
      'Identifica las consonantes oclusivas (/p/, /b/, /t/, /d/, /k/, /g/).',
      'Toca los labios o la lengua apenas como una pluma rozando el papel, sin presionar.',
      'Siente el aire escapando suavemente en lugar de acumular presión explosiva.',
      'Pronuncia palabras como "Papá" o "Taza" con la sensación de rozamiento leve.',
    ],
    visualMode: 'light_articulators',
    faqItems: [
      {
        id: 'lc-1',
        question: '¿Por qué me bloqueo tanto en letras como P, T o K?',
        answer: 'Porque son consonantes oclusivas que requieren cerrar el paso del aire. En la tartamudez, el cerebro envía una orden de fuerza excesiva a los labios o lengua, convirtiendo el cierre en un anclaje rígido.',
        badge: 'Causa',
      },
      {
        id: 'lc-2',
        question: '¿Si no aprieto los labios, se entenderá lo que digo?',
        answer: 'Sí. Los articuladores solo necesitan delimitar el flujo de aire una fracción de milímetro. La inteligibilidad del habla se mantiene 100% clara sin necesidad de aplicar fuerza física.',
        badge: 'Claridad',
      },
      {
        id: 'lc-3',
        question: '¿Cómo sé si estoy aplicando demasiada fuerza?',
        answer: 'Si sientes tensión en los labios, el mentón o la punta de la lengua, o si el aire sale de golpe como una explosión brusca, estás aplicando presión de más. Busca la sensación de pluma o algodón.',
        badge: 'Autocontrol',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Iniciar Práctica de Contacto Pluma',
      stop: 'Pausar Monitoreo de Presión',
      icon: '🪶',
    },
    exerciseGoal: 'Tacto ligero de articuladores en consonantes oclusivas (/p, t, k, b, d, g/)',
    recommendedCategory: 'diadococinesia',
  },

  prolonged_speech: {
    id: 'prolonged_speech',
    familyId: 'fluency_shaping',
    name: 'Habla Prolongada y Fonación Continua',
    shortName: 'Habla Prolongada',
    icon: '〰️',
    badge: 'Fonación Continua',
    difficulty: 'Intermedio',
    summary: 'Estiramiento intencionado de las vocales enlazando las palabras en una corriente aérea ininterrumpida.',
    clinicalObjective: 'Mantener las cuerdas vocales en vibración constante sin arranques ni frenadas motoras repentinas.',
    neurobiologicalBasis: 'Sincroniza la retroalimentación auditiva prolongada, induciendo un ritmo lento que reduce la sobrecarga de procesamiento motriz en el área de Broca.',
    practicalSteps: [
      'Extiende las vocales al doble de su duración natural (ej. "Hoooolaaa... cooomooo... eeeeestaaas").',
      'No cortes el aire ni el sonido entre el final de una palabra y el inicio de la siguiente.',
      'Imagina tu voz como una cinta elástica suave que nunca se corta.',
      'Reduce la velocidad global del habla a unas 60-80 palabras por minuto.',
    ],
    visualMode: 'vowel_elastic',
    faqItems: [
      {
        id: 'ps-1',
        question: '¿En qué se diferencia de la técnica STS?',
        answer: 'El STS separa cada sílaba en golpes isocrónicos regulares (estilo metrónomo). El Habla Prolongada, en cambio, estira las vocales y las une sin pausas, creando una melodía cantarina y continua.',
        badge: 'Diferencia',
      },
      {
        id: 'ps-2',
        question: '¿Por qué es uno de los métodos con mayor respaldo en clínicas mundiales?',
        answer: 'Programas como el Protocolo Camperdown se basan en el habla prolongada porque activa la fonación continua, impidiendo físicamente que la laringe se cierre en espasmo.',
        badge: 'Evidencia',
      },
      {
        id: 'ps-3',
        question: '¿Cómo pasar de sonar alargado a un tono natural?',
        answer: 'Se entrena en escala del 1 al 9: empiezas en grado 9 (muy prolongado) y progresivamente reduces el estiramiento hasta el grado 1 o 2 (habla natural con ligeras transiciones suaves).',
        badge: 'Escala Camperdown',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Iniciar Fonación Continua (Legato)',
      stop: 'Pausar Habla Prolongada',
      icon: '〰️',
    },
    exerciseGoal: 'Elongación vocálica elástica y ligamiento ininterrumpido entre palabras',
    recommendedCategory: 'vocales',
  },

  box_breathing: {
    id: 'box_breathing',
    familyId: 'physiological',
    name: 'Respiración Diafragmática (Box Breathing)',
    shortName: 'Respiración 4-4-4-4',
    icon: '🌬️',
    badge: 'Calma Neurovegetativa',
    difficulty: 'Principiante',
    summary: 'Ciclo respiratorio cuadrado (Inhalar 4s - Sostener 4s - Exhalar 4s - Pausa 4s) con anclaje abdominal.',
    clinicalObjective: 'Regular el sistema nervioso parasimpático y asegurar soporte de aire adecuado antes de iniciar el habla.',
    neurobiologicalBasis: 'Estimula el nervio vago y disminuye los niveles de cortisol y adrenalina, desactivando el reflejo de lucha/huida que tensa la musculatura fonatoria.',
    practicalSteps: [
      'Inhala por la nariz inflando el abdomen durante 4 segundos.',
      'Sostén el aire con el pecho y hombros relajados durante 4 segundos.',
      'Exhala suavemente por la boca vaciando el aire en 4 segundos.',
      'Mantén los pulmones vacíos en calma durante 4 segundos antes del siguiente ciclo.',
    ],
    visualMode: 'breathing_orb',
    faqItems: [
      {
        id: 'bb-1',
        question: '¿Por qué es importante no inflar el pecho al respirar?',
        answer: 'La respiración clavicular (de pecho y hombros) activa los músculos secundarios del cuello, provocando rigidez directa alrededor de la laringe. La respiración abdominal mantiene el cuello completamente libre.',
        badge: 'Anatomía',
      },
      {
        id: 'bb-2',
        question: '¿Cuándo debo realizar la respiración 4-4-4-4?',
        answer: 'Antes de iniciar cualquier sesión de entrenamiento o cuando sientas que tu ritmo cardíaco y tensión aumentan antes de una llamada, exposición o conversación.',
        badge: 'Momento',
      },
      {
        id: 'bb-3',
        question: '¿Debo hablar mientras exhalo en este ejercicio?',
        answer: 'El Box Breathing es un ejercicio preparatorio de calma. Una vez relajado, pasas a las técnicas activas fonando siempre durante la fase de espiración suave.',
        badge: 'Propósito',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Iniciar Ciclo de Respiración 4-4-4-4',
      stop: 'Detener Respiración Guiada',
      icon: '🌬️',
    },
    exerciseGoal: 'Calma diafragmática y alivio de tensión previa a la fonación',
    recommendedCategory: 'todas',
  },

  pull_out: {
    id: 'pull_out',
    familyId: 'stuttering_modification',
    name: 'Salida Suave del Bloqueo (Pull-Out)',
    shortName: 'Pull-Out (Van Riper)',
    icon: '🔄',
    badge: 'Control en Bloqueo',
    difficulty: 'Avanzado',
    summary: 'Identificación consciente del bloqueo en pleno desarrollo, detención del empuje de fuerza y deslizamiento suave hacia afuera.',
    clinicalObjective: 'Desarmar el reflejo de "empujar con más fuerza" cuando ocurre un bloqueo, transformándolo en una salida controlada.',
    neurobiologicalBasis: 'Entrena la corteza prefrontal y la propiocepción motriz para interrumpir el bucle de pánico neuromuscular durante el espasmo.',
    practicalSteps: [
      'Cuando sientas que te has encallado en una palabra, NO empujes ni fuerces la salida.',
      'Congela conscientemente el bloqueo por un instante y localiza dónde está la tensión (labios, lengua o cuello).',
      'Relaja deliberadamente esa zona de tensión mientras mantienes el flujo suave de aire.',
      'Deslízate lentamente hacia la siguiente vocal con un inicio suave (Pull-Out).',
    ],
    visualMode: 'block_decompression',
    faqItems: [
      {
        id: 'po-1',
        question: '¿Qué es un Pull-Out exactamente?',
        answer: 'Es la técnica creada por Charles Van Riper para "rescatar" la palabra en medio del bloqueo. En lugar de apretar los ojos o forzar la garganta, tomas el control, aflojas la tensión y te deslizas suavemente.',
        badge: 'Van Riper',
      },
      {
        id: 'po-2',
        question: '¿Por qué es malo empujar con fuerza cuando me bloqueo?',
        answer: 'Porque empujar refuerza el reflejo neurológico de lucha, intensificando el espasmo laríngeo y provocando movimientos asociados (tics en ojos, manos o tensión en el cuello).',
        badge: 'Mecánica',
      },
      {
        id: 'po-3',
        question: '¿Requiere mucha práctica?',
        answer: 'Sí, es una técnica avanzada. Primero debes aprender a detectar el bloqueo sin asustarte, luego pausar la fuerza y finalmente deslizarte hacia la fluidez.',
        badge: 'Progresión',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Simular y Desactivar Bloqueo (Pull-Out)',
      stop: 'Reiniciar Ejercicio Pull-Out',
      icon: '🔄',
    },
    exerciseGoal: 'Detención voluntaria de fuerza y escape suave del espasmo',
    recommendedCategory: 'frases_complejas',
  },

  cancellation: {
    id: 'cancellation',
    familyId: 'stuttering_modification',
    name: 'Cancelación y Pausa Consciente (Cancellation)',
    shortName: 'Cancelación (Van Riper)',
    icon: '⏸️',
    badge: 'Post-Bloqueo',
    difficulty: 'Intermedio',
    summary: 'Pausa voluntaria de 3 segundos inmediatamente después de un bloqueo para relajar la musculatura y reformular la palabra con inicio suave.',
    clinicalObjective: 'Erradicar la sensación de frustración post-bloqueo y reemplazar la memoria motriz tensa por una ejecución motriz exitosa.',
    neurobiologicalBasis: 'Reescribe la huella sensorimotriz inmediata en la memoria de trabajo fonológica, evitando el condicionamiento aversivo.',
    practicalSteps: [
      'Si te bloqueas al decir una palabra, termínala sin forzar en exceso.',
      'Detén inmediatamente el habla y haz una pausa completa de 3 segundos.',
      'Inhala desde el abdomen, suelta la tensión de la mandíbula y cuello.',
      'Repite la misma palabra utilizando Inicio Vocal Suave o Contacto Ligero.',
    ],
    visualMode: 'block_decompression',
    faqItems: [
      {
        id: 'can-1',
        question: '¿Por qué hacer una pausa de 3 segundos después de tartamudear?',
        answer: 'Porque permite que el sistema nervioso simpático se desactive y los músculos laríngeos recuperen su tono de reposo, evitando que el siguiente intento se contamine con la tensión residual.',
        badge: 'Propósito',
      },
      {
        id: 'can-2',
        question: '¿No se verá raro pausar 3 segundos en una conversación?',
        answer: 'Una pausa deliberada y serena de 3 segundos se percibe socialmente como una persona reflexiva que piensa lo que dice, a diferencia de los bloqueos forzados con tensión visible.',
        badge: 'Impacto Social',
      },
      {
        id: 'can-3',
        question: '¿Cómo cambia mi cerebro esta técnica?',
        answer: 'Evita que el cerebro registre la palabra bloqueada como un "fracaso inevitable". Al repetirla de forma suave y controlada, tu cerebro archiva una experiencia de éxito articulatorio.',
        badge: 'Neuroplasticidad',
      },
    ],
    isRhythmic: false,
    actionButton: {
      start: 'Iniciar Protocolo de Cancelación (3s)',
      stop: 'Reiniciar Secuencia de Cancelación',
      icon: '⏸️',
    },
    exerciseGoal: 'Pausa deliberada de 3 segundos post-bloqueo y reformulación motriz suave',
    recommendedCategory: 'frases_complejas',
  },
};

/**
 * Obtiene las técnicas agrupadas por familia para alimentar el menú modular.
 */
export function getTechniquesByFamily() {
  return TECHNIQUE_FAMILIES.map((fam) => ({
    ...fam,
    techniqueItems: fam.techniques.map((id) => CLINICAL_TECHNIQUES[id]),
  }));
}
