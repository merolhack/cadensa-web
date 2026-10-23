import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { AudioMetronome } from '../../src/lib/audioMetronome.js';

let metronomeInstance: AudioMetronome;

Given('que el metrónomo está inicializado a {int} BPM', function (initialBpm: number) {
  metronomeInstance = new AudioMetronome(initialBpm);
});

When('el usuario inicia el metrónomo', function () {
  metronomeInstance.start();
});

Then('el estado de reproducción debe ser activo', function () {
  assert.strictEqual(metronomeInstance.getState().isPlaying, true);
});

When('el usuario detiene el metrónomo', function () {
  metronomeInstance.stop();
});

Then('el estado de reproducción debe ser inactivo', function () {
  assert.strictEqual(metronomeInstance.getState().isPlaying, false);
});

Given('que el metrónomo está en velocidad inicial de {int} BPM', function (bpm: number) {
  metronomeInstance = new AudioMetronome(bpm);
});

When('el usuario cambia el tempo a {int} BPM', function (newBpm: number) {
  metronomeInstance.setBpm(newBpm);
});

Then('el tempo resultante debe ser {int} BPM', function (expectedBpm: number) {
  assert.strictEqual(metronomeInstance.getState().bpm, expectedBpm);
});

Given('que el metrónomo está con audio habilitado', function () {
  metronomeInstance = new AudioMetronome(80);
  metronomeInstance.setMuted(false);
});

When('el usuario activa el modo silencio', function () {
  metronomeInstance.setMuted(true);
});

Then('el estado de silencio debe ser verdadero', function () {
  assert.strictEqual(metronomeInstance.getState().isMuted, true);
});

When('el usuario desactiva el modo silencio', function () {
  metronomeInstance.setMuted(false);
});

Then('el estado de silencio debe ser falso', function () {
  assert.strictEqual(metronomeInstance.getState().isMuted, false);
});
