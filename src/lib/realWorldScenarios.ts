import { TechniqueId } from './clinicalTechniques';

export interface SimulationScenario {
  id: string;
  title: string;
  icon: string;
  pressureLevel: 'Moderada' | 'Alta';
  recommendedTechniqueId: TechniqueId;
  recommendedBpm: number;
  contextPrompt: string;
  targetResponses: string[];
}

export const REAL_WORLD_SCENARIOS: SimulationScenario[] = [
  {
    id: 'llamada_telefonica',
    title: 'Llamada para Cita Médica',
    icon: '📞',
    pressureLevel: 'Moderada',
    recommendedTechniqueId: 'easy_onset',
    recommendedBpm: 85,
    contextPrompt: 'Hola, gracias por llamar a la clínica. ¿Para qué especialidad desea agendar su cita hoy?',
    targetResponses: [
      'Hola, quisiera pedir una cita con el doctor general.',
      'Buenos días, necesito programar una revisión con el dermatólogo pronto.',
      'Hola, deseo agendar una consulta para el próximo lunes por favor.',
    ],
  },
  {
    id: 'presentacion_laboral',
    title: 'Presentación en Equipo',
    icon: '👥',
    pressureLevel: 'Alta',
    recommendedTechniqueId: 'sts',
    recommendedBpm: 75,
    contextPrompt: 'Bienvenido al equipo. ¿Podrías decirnos brevemente quién eres y cuál es tu rol aquí?',
    targetResponses: [
      'Hola a todos, soy el nuevo analista de proyectos digitales.',
      'Mucho gusto, mi nombre es Juan y seré su coordinador.',
      'Hola, estoy muy feliz de integrarme a este equipo de trabajo.',
    ],
  },
  {
    id: 'restaurante_pedido',
    title: 'Pedido en Restaurante',
    icon: '🍔',
    pressureLevel: 'Moderada',
    recommendedTechniqueId: 'light_contact',
    recommendedBpm: 90,
    contextPrompt: 'Buenas tardes, ya estoy listo para tomar su orden. ¿Qué desea ordenar para comer?',
    targetResponses: [
      'Quisiera una hamburguesa clásica con papas fritas y refresco.',
      'Para mí será la ensalada césar con pollo a la plancha.',
      'Me gustaría pedir el menú del día con un jugo natural.',
    ],
  },
  {
    id: 'entrevista_profesional',
    title: 'Entrevista de Trabajo',
    icon: '💼',
    pressureLevel: 'Alta',
    recommendedTechniqueId: 'pull_out',
    recommendedBpm: 80,
    contextPrompt: '¿Cuál considera que es su mayor fortaleza profesional y cómo ayuda a la empresa?',
    targetResponses: [
      'Mi mayor fortaleza es la capacidad de resolver problemas complejos.',
      'Soy una persona muy organizada y enfocada en los resultados.',
      'Tengo mucha experiencia liderando equipos en entornos de mucha presión.',
    ],
  },
];
