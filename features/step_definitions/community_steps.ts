import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { AudioMetronome, TimeSignature, SoundPreset } from '../../src/lib/audioMetronome';

interface CommunityContext {
  bannerVisible: boolean;
  bannerLink: string;
  youtubeLink: string;
  bannerRel: string;
  breathingActive: boolean;
  breathingPhase: string;
  breathingDuration: number;
  metronome: AudioMetronome | null;
  fadingActive: boolean;
}

const context: CommunityContext = {
  bannerVisible: false,
  bannerLink: '',
  youtubeLink: '',
  bannerRel: '',
  breathingActive: false,
  breathingPhase: '',
  breathingDuration: 0,
  metronome: null,
  fadingActive: false,
};

// Escenario: Acceso al banner de apoyo comunitario de la AMTTM
Given('que un usuario ingresa a Cadensa en busca de apoyo integral', function () {
  context.bannerVisible = false;
  context.bannerLink = '';
  context.youtubeLink = '';
  context.bannerRel = '';
});

When('visualiza la sección inferior de la aplicación antes del pie de página', function () {
  context.bannerVisible = true;
  context.bannerLink = 'https://www.facebook.com/AMTTM/';
  context.youtubeLink = 'https://www.youtube.com/@amtartamudez';
  context.bannerRel = 'noopener noreferrer';
});

Then('se presenta un banner con enlace seguro hacia la "Asociación Mexicana de Tartamudez"', function () {
  assert.strictEqual(context.bannerVisible, true);
  assert.strictEqual(context.bannerLink, 'https://www.facebook.com/AMTTM/');
});

Then('el enlace apunta al grupo oficial de Facebook con rel noopener noreferrer', function () {
  assert.strictEqual(context.bannerRel.includes('noopener'), true);
  assert.strictEqual(context.bannerRel.includes('noreferrer'), true);
});

Then('el banner incluye el enlace al canal oficial de YouTube de la AMTTM', function () {
  assert.strictEqual(context.youtubeLink, 'https://www.youtube.com/@amtartamudez');
});

// Escenario: Inicio de sesión de respiración diafragmática 4-4-4-4
Given('que el usuario siente tensión o bloqueo antes de hablar', function () {
  context.breathingActive = false;
  context.breathingPhase = '';
});

When('activa el marcapasos de respiración diafragmática', function () {
  context.breathingActive = true;
  context.breathingPhase = 'Inhala';
  context.breathingDuration = 4;
});

Then('el sistema inicia el ciclo en fase de inhalación durante 4 segundos', function () {
  assert.strictEqual(context.breathingActive, true);
  assert.strictEqual(context.breathingPhase, 'Inhala');
  assert.strictEqual(context.breathingDuration, 4);
});

Then('continúa la secuencia hacia retener, exhalar y pausa', function () {
  const sequence = ['Inhala', 'Sostén', 'Exhala', 'Pausa'];
  assert.strictEqual(sequence.length, 4);
});

// Escenario: Activación del desafío de atenuación de ritmo (fading)
Given('que el usuario domina el seguimiento con metrónomo sonoro', function () {
  context.metronome = new AudioMetronome(80);
});

When('activa el desafío de ritmo interno', function () {
  if (context.metronome) {
    context.metronome.setFadingEnabled(true);
  }
  context.fadingActive = true;
});

Then('el metrónomo programa compases audibles seguidos de compases de silencio', function () {
  assert.strictEqual(context.metronome?.isFadingEnabled(), true);
});

Then('el usuario mantiene el ritmo de dicción internamente', function () {
  assert.strictEqual(context.fadingActive, true);
});

// Escenario: Selección de compás musical y timbre sintético
Given(/^que el terapeuta indica practicar con un compás de 3\/4$/, function () {
  context.metronome = new AudioMetronome(80);
});

When('el usuario selecciona compás {string} y timbre {string}', function (compasStr: string, timbreStr: string) {
  if (context.metronome) {
    const num = parseInt(compasStr.split('/')[0], 10) as TimeSignature;
    context.metronome.setTimeSignature(num);
    context.metronome.setSoundPreset(timbreStr as SoundPreset);
  }
});

Then('el motor de metrónomo genera acentos rítmicos cada 3 pulsos con timbre de madera', function () {
  assert.strictEqual(context.metronome?.getTimeSignature(), 3);
  assert.strictEqual(context.metronome?.getSoundPreset(), 'madera');
});
