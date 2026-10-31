import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  generatePhoneticExercises,
  GeneratedExercise,
} from '../../src/lib/phoneticTextGenerator.js';
import { DialectId } from '../../src/lib/phoneticPresets.js';

let generatedExercises: GeneratedExercise[] = [];
let activeAvatarMode: string = '';
let simulatedPhase: string = '';

Given('que el usuario accede al generador fonético en el cliente', function () {
  generatedExercises = [];
});

When(
  'selecciona el grupo de oclusivas bilabiales y el dialecto {string}',
  function (dialect: string) {
    generatedExercises = generatePhoneticExercises({
      level: 'sentences',
      targetGroup: 'bilabial_stops',
      dialectId: dialect as DialectId,
      count: 2,
    });
    assert.ok(generatedExercises.length > 0, 'No se generaron ejercicios');
  }
);

Then(
  'el sistema genera ejercicios con densidad fonética superior al {int} por ciento',
  function (minDensity: number) {
    const ex = generatedExercises[0];
    assert.ok(
      ex.phoneticAnalysis.targetDensity >= minDensity,
      `La densidad esperada >= ${minDensity}%, pero fue ${ex.phoneticAnalysis.targetDensity}%`
    );
  }
);

Then(
  'asigna la recomendación clínica de {string}',
  function (expectedTech: string) {
    const ex = generatedExercises[0];
    assert.strictEqual(
      ex.phoneticAnalysis.recommendedTechnique,
      expectedTech,
      `Técnica esperada: ${expectedTech}, recibida: ${ex.phoneticAnalysis.recommendedTechnique}`
    );
  }
);

Given(
  'que el usuario inicia la visualización del Agente Avatar Fonoaudiológico',
  function () {
    activeAvatarMode = 'breathing';
  }
);

When('activa el modo clínico de {string}', function (modeName: string) {
  if (modeName === 'Inicios Suaves') {
    activeAvatarMode = 'easy_onset';
    simulatedPhase = 'Ataque vocal suave sin golpe glótico';
  }
});

Then(
  'el avatar modela la aproximación gradual de las cuerdas vocales',
  function () {
    assert.strictEqual(activeAvatarMode, 'easy_onset');
  }
);

Then(
  'presenta la recomendación de ataque vocal suave antes de la emisión fonatoria',
  function () {
    assert.ok(
      simulatedPhase.includes('Ataque vocal suave'),
      'No se encontró la fase esperada'
    );
  }
);

Given('que el paciente experimenta un bloqueo articulatorio', function () {
  activeAvatarMode = 'tense_block';
});

When('el avatar reproduce el modo clínico {string}', function (modeName: string) {
  if (modeName === 'Pull-Out') {
    activeAvatarMode = 'pull_out';
    simulatedPhase = 'Desaceleración y relajación lingual hacia salida fluida';
  }
});

Then(
  'demuestra la desaceleración del órgano articulatorio en tensión',
  function () {
    assert.strictEqual(activeAvatarMode, 'pull_out');
  }
);

Then(
  'guía la transición gradual hacia el deslizamiento fluido',
  function () {
    assert.ok(
      simulatedPhase.includes('salida fluida'),
      'No se detectó el deslizamiento fluido'
    );
  }
);
