import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { syllabifyWord, flattenSentenceSyllables } from '../../src/lib/syllables.js';

interface SyllableWorld {
  word?: string;
  syllablesResult?: string[];
  sentence?: string;
  sequenceResult?: string[];
}

const state: SyllableWorld = {};

Given('que el usuario tiene la palabra {string}', function (word: string) {
  state.word = word;
});

When('el motor fonético procesa la palabra', function () {
  if (!state.word) throw new Error('Palabra no proporcionada');
  state.syllablesResult = syllabifyWord(state.word);
});

Then('debe dividirse en {int} sílabas', function (expectedCount: number) {
  assert.strictEqual(
    state.syllablesResult?.length,
    expectedCount,
    `Conteo inesperado de sílabas para ${state.word}`
  );
});

Then('la representación silábica unida con guiones debe ser {string}', function (expectedHyphenated: string) {
  const actual = state.syllablesResult?.join('-');
  assert.strictEqual(actual, expectedHyphenated);
});

Given('que el usuario selecciona la frase {string}', function (sentence: string) {
  state.sentence = sentence;
});

When('el sistema segmenta la frase completa', function () {
  if (!state.sentence) throw new Error('Frase no proporcionada');
  state.sequenceResult = flattenSentenceSyllables(state.sentence);
});

Then('se debe generar una secuencia ordenada de {int} sílabas', function (expectedCount: number) {
  assert.strictEqual(state.sequenceResult?.length, expectedCount);
});

Then('la primera sílaba debe ser {string}', function (expectedFirst: string) {
  assert.strictEqual(state.sequenceResult?.[0], expectedFirst);
});

Then('la última sílaba debe ser {string}', function (expectedLast: string) {
  assert.strictEqual(
    state.sequenceResult?.[state.sequenceResult.length - 1],
    expectedLast
  );
});
