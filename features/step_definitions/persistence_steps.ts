import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  recordTrainingSession,
  evaluateDailyStreak,
  SessionResult,
} from '../../src/lib/trainingService.js';

interface PersistenceWorld {
  session?: SessionResult;
  saveResult?: { success: boolean; offline: boolean };
  lastDateStr?: string;
  streakEvaluation?: { newStreak: number; shouldIncrement: boolean; wasReset: boolean };
}

const state: PersistenceWorld = {};

Given('que el usuario completa un ejercicio de {int} sílabas a {int} BPM', function (syllables: number, bpm: number) {
  state.session = {
    bpm,
    durationSeconds: 60,
    syllableCount: syllables,
    accuracyScore: 98,
    exercisePhrase: 'Cadensa entrena tu fluidez',
  };
});

Given('la duración fue de {int} segundos con precisión de {int}%', function (seconds: number, accuracy: number) {
  if (state.session) {
    state.session.durationSeconds = seconds;
    state.session.accuracyScore = accuracy;
  }
});

When('se guarda la sesión de entrenamiento', async function () {
  if (!state.session) throw new Error('Sesión no definida');
  state.saveResult = await recordTrainingSession(state.session);
});

Then('el registro debe ser guardado exitosamente', function () {
  assert.strictEqual(state.saveResult?.success, true);
});

Then('la racha del usuario debe iniciar en {int} día', function (expectedStreak: number) {
  const result = evaluateDailyStreak(null);
  assert.strictEqual(result.newStreak, expectedStreak);
});

Given('que la última sesión registrada fue {string}', function (diasAtras: string) {
  const date = new Date();
  if (diasAtras === 'ayer') {
    date.setDate(date.getDate() - 1);
  } else if (diasAtras === 'tres_dias') {
    date.setDate(date.getDate() - 3);
  }
  state.lastDateStr = date.toISOString();
});

When('el sistema evalúa la racha con el entrenamiento de hoy', function () {
  state.streakEvaluation = evaluateDailyStreak(state.lastDateStr || null);
});

Then('el estado de incremento debe ser {string}', function (expectedInc: string) {
  assert.strictEqual(state.streakEvaluation?.shouldIncrement, expectedInc === 'true');
});

Then('el estado de reinicio debe ser {string}', function (expectedReset: string) {
  assert.strictEqual(state.streakEvaluation?.wasReset, expectedReset === 'true');
});
