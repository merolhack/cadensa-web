import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  evaluateRhythmicAccuracy,
  AccuracyResult,
} from '../../src/lib/voiceDetection.js';

interface AccuracyWorld {
  beatTimeMs?: number;
  speechTimeMs?: number;
  accuracyResult?: AccuracyResult;
}

const state: AccuracyWorld = {};

Given('que el metrónomo emite un pulso en el milisegundo {int}', function (beatMs: number) {
  state.beatTimeMs = beatMs;
});

Given('el usuario emite una sílaba en el milisegundo {int}', function (speechMs: number) {
  state.speechTimeMs = speechMs;
});

When('el sistema calcula la precisión rítmica', function () {
  if (state.beatTimeMs === undefined || state.speechTimeMs === undefined) {
    throw new Error('Tiempos no definidos');
  }
  state.accuracyResult = evaluateRhythmicAccuracy(state.speechTimeMs, state.beatTimeMs);
});

Then('la calificación debe ser {string}', function (expectedGrade: string) {
  assert.strictEqual(state.accuracyResult?.grade, expectedGrade);
});

Then('el puntaje asignado debe ser {int}', function (expectedScore: number) {
  assert.strictEqual(state.accuracyResult?.score, expectedScore);
});
