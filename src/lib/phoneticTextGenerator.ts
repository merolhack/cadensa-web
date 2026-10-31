/**
 * Generador Dinámico de Textos Fonéticamente Balanceados por Dialecto
 * Cadensa — Client-Side NLP Engine
 * 
 * Genera y clasifica ejercicios fonoaudiológicos personalizados según la zona
 * de conflicto articulatorio del paciente (oclusivas, fricativas, inicios vocálicos)
 * y el dialecto hispanohablante seleccionado, calculando métricas de densidad fonemática.
 * 
 * Principio Zero Trust: Se ejecuta 100% en el navegador sin transmitir datos fónicos o textuales.
 */

import { DialectId } from './phoneticPresets';

export type PhoneticTargetGroup =
  | 'bilabial_stops'   // /p/, /b/, /m/
  | 'dental_stops'     // /t/, /d/
  | 'velar_stops'      // /k/, /g/
  | 'fricatives'       // /f/, /s/, /j/
  | 'liquids'          // /l/, /r/, /rr/
  | 'vowel_onsets'     // /a/, /e/, /i/, /o/, /u/
  | 'balanced';        // Distribución equilibrada

export type ExerciseLevel =
  | 'isolated'    // Sílabas aisladas
  | 'bisyllables' // Palabras bisílabas
  | 'sentences'   // Oraciones de longitud controlada
  | 'prose';      // Párrafos en prosa fluida

export interface PhoneticAnalysisResult {
  text: string;
  syllableCount: number;
  targetDensity: number; // Porcentaje de fonemas diana (0 a 100)
  difficultyScore: number; // 0 a 100
  recommendedTechnique: string;
  recommendedBpm: number;
  targetGroup: PhoneticTargetGroup;
}

export interface GeneratedExercise {
  id: string;
  text: string;
  level: ExerciseLevel;
  targetGroup: PhoneticTargetGroup;
  dialectId: DialectId;
  phoneticAnalysis: PhoneticAnalysisResult;
  tips: string;
}

// Catálogo de corpus fonético graduado por dialecto y grupo articulatorio
interface CorpusItem {
  text: string;
  dialects?: DialectId[]; // Si no se especifica, aplica a todos
}

const PHONETIC_CORPUS: Record<PhoneticTargetGroup, Record<ExerciseLevel, CorpusItem[]>> = {
  bilabial_stops: {
    isolated: [
      { text: 'pa ba ma' },
      { text: 'po bo mo' },
      { text: 'pi bi mi' },
      { text: 'pe be me' },
      { text: 'pu bu mu' },
    ],
    bisyllables: [
      { text: 'paso bote puma masa mapa beso' },
      { text: 'pato mapa bola beso polo muro' },
      { text: 'boca pelo pino bono meta peso' },
      { text: 'barco playa bolso mate puma barco', dialects: ['cono_sur', 'caribeno'] },
      { text: 'padre madre peso bote pico bota', dialects: ['mx_central', 'andino', 'iberico'] },
    ],
    sentences: [
      { text: 'Pedro busca una manzana madura en el bosque.', dialects: ['mx_central'] },
      { text: 'Pablo pasea por la playa buscando un barco blanco.', dialects: ['cono_sur'] },
      { text: 'Manuel prepara un buen mate por la mañana.', dialects: ['cono_sur'] },
      { text: 'Berta mira el bello panorama desde la montaña.', dialects: ['andino'] },
      { text: 'Paco bebe un batido fresco frente a la bahía.', dialects: ['caribeno'] },
      { text: 'Beatriz pasea por el pueblo mirando los barcos.', dialects: ['iberico'] },
      { text: 'La primavera trae muchas flores bellas y mariposas al parque.' },
      { text: 'Mi perro busca la pelota blanca bajo la mesa.' },
    ],
    prose: [
      {
        text: 'Por la mañana, Pedro y Blanca caminaron pausadamente hacia el mercado del pueblo. Llevaban bolsas de papel para comprar manzanas maduras, plátanos frescos y buen pan artesanal recién horneado.',
      },
      {
        text: 'La brisa matutina movía los barcos anclados en la bahía de pescadores. Manuel miraba el panorama con calma profunda, sintiendo que cada palabra fluía con suavidad y ligereza.',
      },
    ],
  },

  dental_stops: {
    isolated: [
      { text: 'ta da te de' },
      { text: 'to do tu du' },
      { text: 'ti di ta da' },
      { text: 'te de ti di' },
    ],
    bisyllables: [
      { text: 'todo tapa dedo tela dato copa' },
      { text: 'taza diente torre donde tarde tema' },
      { text: 'tarde dueño trago danza tribu delta' },
      { text: 'tiempo doble trigo dulce trama ducha' },
    ],
    sentences: [
      { text: 'Daniel toma té todos los días por la tarde.', dialects: ['mx_central'] },
      { text: 'Tomás decide caminar despacio por toda la avenida.', dialects: ['cono_sur'] },
      { text: 'Dora tiene dos tareas pendientes para la tarde.', dialects: ['andino'] },
      { text: 'Tito toca el tambor con destreza y deleite.', dialects: ['caribeno'] },
      { text: 'Teresa da detalles de todo el trayecto recorrido.', dialects: ['iberico'] },
      { text: 'El tiempo despejado invita a dar un tranquilo paseo.' },
    ],
    prose: [
      {
        text: 'Durante la tarde, Tomás decidió ordenar todos los documentos de su trabajo. Con paciencia y tranquilidad, colocó cada detalle en su debido lugar, tomando pequeños descansos para respirar.',
      },
      {
        text: 'El tren avanzaba a paso constante a través del tendido de vías. Teresa miraba los detalles del paisaje dorado mientras sentía la soltura y ligereza en cada contacto lingual.',
      },
    ],
  },

  velar_stops: {
    isolated: [
      { text: 'ka ga ko go' },
      { text: 'ku gu ke ge' },
      { text: 'ki gi ka ga' },
    ],
    bisyllables: [
      { text: 'casa gato cuna gota copa goma' },
      { text: 'gorro cabo gafas queso guía quilla' },
      { text: 'campo golpe calma gusto calle ganas' },
    ],
    sentences: [
      { text: 'Carlos cuida el gato gris que corre en el campo.', dialects: ['mx_central'] },
      { text: 'Gustavo camina con calma guiando a su grupo.', dialects: ['cono_sur'] },
      { text: 'Camila compra quinua y granos en el gran mercado.', dialects: ['andino'] },
      { text: 'Gabi canta con gusto caribeño frente a la costa.', dialects: ['caribeno'] },
      { text: 'Quique come queso gallego con gran agrado.', dialects: ['iberico'] },
      { text: 'El guía caminaba con paso calmado por el camino rocoso.' },
    ],
    prose: [
      {
        text: 'Cerca de la colina verde, Gustavo encontró un gran nogal cargado de frutos. Con calma y serenidad, comenzó a recoger las nueces caídas, disfrutando del sonido del viento entre las ramas.',
      },
      {
        text: 'La caravana cruzó el campo abierto guiada por Carlos. Cada cumbre alcanzada era una nueva oportunidad para agradecer la quietud y el ritmo constante del camino.',
      },
    ],
  },

  fricatives: {
    isolated: [
      { text: 'fa sa ja' },
      { text: 'fo so jo' },
      { text: 'fi si ji' },
      { text: 'fe se je' },
    ],
    bisyllables: [
      { text: 'faro salsa julio foco seda jaula' },
      { text: 'fino sobre jefe firma suave joya' },
      { text: 'fiesta sello jilguero forma sol jardín' },
    ],
    sentences: [
      { text: 'Sofía siente satisfacción al finalizar su faena.', dialects: ['mx_central'] },
      { text: 'Facundo sale siempre silbando una suave zamba.', dialects: ['cono_sur'] },
      { text: 'Jaime sube feliz hacia el sendero sin sombra.', dialects: ['andino'] },
      { text: 'Sara sonríe frente al fresco sol de San Juan.', dialects: ['caribeno'] },
      { text: 'Fernando sale al jardín sujetando flores frescas.', dialects: ['iberico'] },
      { text: 'La suave brisa favorece el sosiego y la serenidad.' },
    ],
    prose: [
      {
        text: 'Sofía se sentó junto a la fuente del jardín para disfrutar del fresco atardecer. Las hojas caían suavemente al compás del viento, transmitiendo una profunda sensación de sosiego y calma.',
      },
      {
        text: 'Fernando finalizó su jornada laboral sintiendo una satisfacción serena. Su respiración fluía sin esfuerzo, como el cauce de un río que recorre el valle con placidez.',
      },
    ],
  },

  liquids: {
    isolated: [
      { text: 'la ra rra' },
      { text: 'lo ro rro' },
      { text: 'li ri rri' },
      { text: 'le re rre' },
    ],
    bisyllables: [
      { text: 'luna rosa rama loro lago reja' },
      { text: 'lupa río libro rueda lima raya' },
      { text: 'llave reloj lirio playa lana roble' },
    ],
    sentences: [
      { text: 'Lorena riega las rosas rojas del rincón.', dialects: ['mx_central'] },
      { text: 'Rodrigo recorre las rutas rurales del litoral.', dialects: ['cono_sur'] },
      { text: 'Lucía reúne las ramas caídas del río.', dialects: ['andino'] },
      { text: 'Raúl relata la leyenda del lucero radiante.', dialects: ['caribeno'] },
      { text: 'Ramón lee relatos largos a la luz de la luna.', dialects: ['iberico'] },
      { text: 'La melodía del arroyo relaja los pensamientos.' },
    ],
    prose: [
      {
        text: 'Rodrigo recorría las riberas del lago cristalino observando el reflejo de las cumbres nevadas. El aire puro llenaba sus pulmones, marcando un compás sereno y natural en cada paso.',
      },
      {
        text: 'A lo largo de la alameda florecida, Lucía caminaba lentamente escuchando el rumor de los laureles. Sentía una conexión armoniosa con el entorno y una notable ligereza al pronunciar cada sonido.',
      },
    ],
  },

  vowel_onsets: {
    isolated: [
      { text: 'ah eh ih oh uh' },
      { text: 'ha he hi ho hu' },
      { text: 'am em im om um' },
    ],
    bisyllables: [
      { text: 'ala ola uva isla eco uno' },
      { text: 'aire azul oso imán alto olla' },
      { text: 'alma agua hilo hoyo humo onda' },
    ],
    sentences: [
      { text: 'Ángel admira el amplio horizonte azul desde el árbol.', dialects: ['mx_central'] },
      { text: 'Ignacio abre la antigua estancia al amanecer.', dialects: ['cono_sur'] },
      { text: 'Esteban escucha el eco apagado entre las alturas.', dialects: ['andino'] },
      { text: 'Ana observa las olas azules acercarse a la orilla.', dialects: ['caribeno'] },
      { text: 'Inés espera la llegada del otoño en el olivar.', dialects: ['iberico'] },
      { text: 'El amanecer ofrece una oportunidad única para la calma.' },
    ],
    prose: [
      {
        text: 'Al amanecer, Elena abrió la ventana para inspirar el aire fresco de la montaña. Con una suave exhalación previa a cada palabra, agradeció la quietud del nuevo día y la calma de su voz.',
      },
      {
        text: 'El sendero ascendía suavemente hacia una explanada iluminada por el sol matinal. Cada paso invitaba a una respiración consciente, permitiendo que la voz naciera sin tensión ni prisa.',
      },
    ],
  },

  balanced: {
    isolated: [
      { text: 'pa ta ka sa la' },
      { text: 'ba da ga fa ra' },
      { text: 'ma na ña ja wa' },
    ],
    bisyllables: [
      { text: 'cielo calma ritmo paso vida' },
      { text: 'puente senda canto brisa monte' },
      { text: 'tiempo noche verde claro suave' },
    ],
    sentences: [
      { text: 'El ritmo constante de mi voz me permite hablar con total serenidad.', dialects: ['mx_central'] },
      { text: 'Caminar a paso tranquilo ayuda acompasar la respiración y la palabra.', dialects: ['cono_sur'] },
      { text: 'En cada pausa voluntaria encuentro la calma necesaria para continuar.', dialects: ['andino'] },
      { text: 'La brisa del mar acompaña el compás natural de cada conversación.', dialects: ['caribeno'] },
      { text: 'La práctica paciente y constante afianza la soltura en el habla.', dialects: ['iberico'] },
      { text: 'Encuentro el ritmo natural de mi voz con seguridad y serenidad.' },
      { text: 'Respiro profundamente antes de iniciar cada nueva frase.' },
    ],
    prose: [
      {
        text: 'Aprender a hablar con cadencia es como aprender a tocar un instrumento musical. Cuando permitimos que el ritmo marque el compás, las palabras fluyen sin esfuerzo y el diálogo se convierte en un placer compartido.',
      },
      {
        text: 'La verdadera fluidez no consiste en hablar deprisa, sino en comunicarse con presencia, calma y seguridad. Cada frase es una oportunidad para conectar con los demás a través del ritmo propio de nuestra voz.',
      },
    ],
  },
};

/**
 * Cuenta aproximada de sílabas en español basada en núcleos vocálicos
 */
export function countSpanishSyllables(text: string): number {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-zñ\s]/g, '');

  const words = clean.split(/\s+/).filter(Boolean);
  let totalSyllables = 0;

  for (const word of words) {
    // Patrón de núcleos vocálicos en español
    const vowels = word.match(/[aeiouy]+/g);
    totalSyllables += vowels ? Math.max(vowels.length, 1) : 1;
  }

  return Math.max(totalSyllables, 1);
}

/**
 * Calcula la densidad de fonemas objetivo y el puntaje de dificultad
 */
export function analyzePhoneticComplexity(
  text: string,
  targetGroup: PhoneticTargetGroup
): PhoneticAnalysisResult {
  const syllables = countSpanishSyllables(text);
  const clean = text.toLowerCase();
  const totalLetters = clean.replace(/[^a-záéíóúüñ]/g, '').length || 1;

  let targetMatches = 0;
  let recommendedTechnique = 'Habla Rítmica Silábica (STS)';
  let recommendedBpm = 80;

  switch (targetGroup) {
    case 'bilabial_stops':
      targetMatches = (clean.match(/[pbm]/g) || []).length;
      recommendedTechnique = 'Contacto Articulador Ligero';
      recommendedBpm = 75;
      break;
    case 'dental_stops':
      targetMatches = (clean.match(/[td]/g) || []).length;
      recommendedTechnique = 'Contacto Articulador Ligero';
      recommendedBpm = 75;
      break;
    case 'velar_stops':
      targetMatches = (clean.match(/[kgcq]/g) || []).length;
      recommendedTechnique = 'Inicio Suave (Easy Onset)';
      recommendedBpm = 70;
      break;
    case 'fricatives':
      targetMatches = (clean.match(/[fsjxz]/g) || []).length;
      recommendedTechnique = 'Habla Prolongada';
      recommendedBpm = 85;
      break;
    case 'liquids':
      targetMatches = (clean.match(/[lr]/g) || []).length;
      recommendedTechnique = 'Habla Rítmica Silábica (STS)';
      recommendedBpm = 80;
      break;
    case 'vowel_onsets':
      targetMatches = (clean.match(/\b[aeiouáéíóú]/g) || []).length * 2;
      recommendedTechnique = 'Inicio Suave (Easy Onset)';
      recommendedBpm = 65;
      break;
    case 'balanced':
    default:
      targetMatches = Math.round(totalLetters * 0.25);
      recommendedTechnique = 'Habla Rítmica Silábica (STS)';
      recommendedBpm = 80;
      break;
  }

  const targetDensity = Math.min(100, Math.round((targetMatches / totalLetters) * 100));

  // Cálculo de dificultad (0 a 100) ponderado por longitud de sílabas y densidad
  const lengthFactor = Math.min(50, syllables * 2);
  const densityFactor = Math.min(50, Math.round(targetDensity * 0.8));
  const difficultyScore = Math.min(100, lengthFactor + densityFactor);

  return {
    text,
    syllableCount: syllables,
    targetDensity,
    difficultyScore,
    recommendedTechnique,
    recommendedBpm,
    targetGroup,
  };
}

/**
 * Genera una lista de ejercicios fonéticamente balanceados
 */
export function generatePhoneticExercises({
  level = 'sentences',
  targetGroup = 'balanced',
  dialectId = 'mx_central',
  count = 3,
}: {
  level?: ExerciseLevel;
  targetGroup?: PhoneticTargetGroup;
  dialectId?: DialectId;
  count?: number;
}): GeneratedExercise[] {
  const corpus = PHONETIC_CORPUS[targetGroup]?.[level] || PHONETIC_CORPUS.balanced.sentences;

  // Filtrar según compatibilidad dialectal (o universal si no declara dialects)
  const compatible = corpus.filter(
    (item) => !item.dialects || item.dialects.includes(dialectId)
  );

  const pool = compatible.length > 0 ? compatible : corpus;
  const results: GeneratedExercise[] = [];

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const item = pool[i];
    const analysis = analyzePhoneticComplexity(item.text, targetGroup);

    let tips = 'Pronuncia cada sílaba sincronizada con el pulso sin apresurar la salida.';
    if (targetGroup === 'vowel_onsets') {
      tips = 'Comienza con una exhalación suave y permite que la vocal surja sin golpe glótico.';
    } else if (targetGroup === 'bilabial_stops' || targetGroup === 'dental_stops') {
      tips = 'Apenas roza los labios o los dientes, evitando apretar con sobretensión muscular.';
    } else if (targetGroup === 'velar_stops') {
      tips = 'Mantén la base de la lengua relajada y relaja el cuello antes de emitir la consonante.';
    }

    results.push({
      id: `gen-${targetGroup}-${level}-${dialectId}-${i}`,
      text: item.text,
      level,
      targetGroup,
      dialectId,
      phoneticAnalysis: analysis,
      tips,
    });
  }

  return results;
}

