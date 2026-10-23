import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  calculateBeatIntervalMs,
  calculateSequenceDurationMs,
  isClinicallyRecommendedBpm,
} from '../../src/lib/rhythm.js';

interface CustomWorld {
  bpm?: number;
  syllables?: number;
  calculatedInterval?: number;
  calculatedDuration?: number;
  evaluationResult?: boolean;
}

const context: CustomWorld = {};

Given('que el usuario configura una cadencia de {int} BPM', function (bpm: number) {
  context.bpm = bpm;
});

When('el sistema calcula el intervalo entre pulsos', function () {
  if (context.bpm === undefined) throw new Error('BPM no definido');
  context.calculatedInterval = calculateBeatIntervalMs(context.bpm);
});

Then('el intervalo debe ser exactamente de {int} milisegundos', function (expectedMs: number) {
  assert.strictEqual(context.calculatedInterval, expectedMs);
});

Given('que el ejercicio contiene {int} sílabas', function (syllables: number) {
  context.syllables = syllables;
});

Given('la velocidad establecida es de {int} BPM', function (bpm: number) {
  context.bpm = bpm;
});

When('el sistema calcula la duración total del ejercicio', function () {
  if (context.bpm === undefined || context.syllables === undefined) {
    throw new Error('BPM o sílabas no definidos');
  }
  context.calculatedDuration = calculateSequenceDurationMs(context.bpm, context.syllables);
});

Then('la duración calculada debe ser de {int} milisegundos', function (expectedDuration: number) {
  assert.strictEqual(context.calculatedDuration, expectedDuration);
});

Given('que un terapeuta o usuario ingresa una velocidad de {int} BPM', function (bpm: number) {
  context.bpm = bpm;
});

When('el motor de cadencia evalúa si es una velocidad recomendada', function () {
  if (context.bpm === undefined) throw new Error('BPM no definido');
  context.evaluationResult = isClinicallyRecommendedBpm(context.bpm);
});

Then('el resultado clínico debe ser {string}', function (expected: string) {
  const expectedBool = expected === 'true';
  assert.strictEqual(context.evaluationResult, expectedBool);
});
