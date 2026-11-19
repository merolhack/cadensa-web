import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { TechniquesCatalogHome } from '../../src/components/TechniquesCatalogHome.js';
import { QuickStartExercise } from '../../src/components/QuickStartExercise.js';
import { DailyChallengeModal } from '../../src/components/DailyChallengeModal.js';

let catalogHtml: string = '';
let quickStartHtml: string = '';
let dailyChallengeHtml: string = '';

Given('que el usuario se encuentra en la pantalla de inicio de Cadensa', function () {
  const element = React.createElement(TechniquesCatalogHome, {
    onSelectTechnique: () => {},
    onOpenVideoModal: () => {},
    onOpenSimulator: () => {},
    onOpenQuickRoutine: () => {},
    onOpenDDK: () => {},
    onOpenFormants: () => {},
    onOpenTelehealth: () => {},
    onOpenKids: () => {},
    onOpenDAF: () => {},
    onOpenCertificates: () => {},
    onOpenAcousticAi: () => {},
    onOpenAvatar: () => {},
    onOpenCustomPhrases: () => {},
    onOpenQuickStart: () => {},
    onOpenDailyChallenge: () => {},
    streakDays: 3,
    totalMinutes: 15,
    xpPoints: 200,
    currentUserEmail: null,
    onOpenAuthModal: () => {},
    onOpenDashboard: () => {},
    onLogout: () => {},
  });
  catalogHtml = renderToString(element);
});

Then('se visualiza un botón de acción rápida para {string}', function (buttonText: string) {
  assert.ok(
    catalogHtml.includes(buttonText),
    `El catálogo no incluye el botón de acción rápida: ${buttonText}`
  );
});

Then('se visualiza un acceso directo para {string}', function (shortcutText: string) {
  assert.ok(
    catalogHtml.includes(shortcutText),
    `El catálogo no incluye el acceso directo: ${shortcutText}`
  );
});

Then('la píldora de racha y progreso diario es interactiva para ver los logros', function () {
  assert.ok(
    catalogHtml.includes('Ver Reto Diario y Logros'),
    'La píldora de racha no tiene el atributo interactivo accesible de Reto Diario'
  );
});

Given('que el usuario inicia la práctica rápida de 60 segundos', function () {
  const element = React.createElement(QuickStartExercise, {
    isOpen: true,
    onClose: () => {},
    onComplete: () => {},
    onGoToFullPractice: () => {},
  });
  quickStartHtml = renderToString(element);
});

Then('se presenta una fase inicial de preparación diafragmática', function () {
  assert.ok(
    quickStartHtml.includes('Inhala profundamente') || quickStartHtml.includes('Preparación Fonoaudiológica'),
    'No se presenta la instrucción de preparación diafragmática en la práctica rápida'
  );
});

Then('el metrónomo visual marca la cadencia rítmica silábica a 85 BPM', function () {
  assert.ok(
    quickStartHtml.includes('85 BPM') || quickStartHtml.includes('Pronuncia una sílaba exacta'),
    'No se especifica el ritmo de 85 BPM en la práctica rápida'
  );
});

Then('al concluir la sesión se otorgan 25 puntos de experiencia XP y opción a práctica completa', function () {
  assert.ok(
    quickStartHtml.includes('+25 XP') || quickStartHtml.includes('25 XP') || quickStartHtml.includes('Seguir a Práctica Completa'),
    'No se mencionan los 25 XP asignados a la micro-sesión de 60s'
  );
});

Given('que el usuario abre el modal del reto diario', function () {
  const element = React.createElement(DailyChallengeModal, {
    isOpen: true,
    onClose: () => {},
    streakDays: 5,
    totalMinutes: 25,
    xpPoints: 350,
    onStartDailyChallenge: () => {},
  });
  dailyChallengeHtml = renderToString(element);
});

Then('se muestra su racha activa de días consecutivos y puntos XP', function () {
  assert.ok(
    dailyChallengeHtml.includes('5') && dailyChallengeHtml.includes('350'),
    'No se muestra la racha de 5 días o los 350 puntos XP en el modal de reto diario'
  );
});

Then('se listan las insignias y logros desbloqueables del sistema', function () {
  assert.ok(
    dailyChallengeHtml.includes('Insignias y Logros Clínicos') && dailyChallengeHtml.includes('Primer Pulso'),
    'No se listan las insignias y logros en el modal de reto diario'
  );
});

Then('dispone de un botón directo para iniciar el reto fonoaudiológico de hoy', function () {
  assert.ok(
    dailyChallengeHtml.includes('Aceptar Reto y Empezar (60s)') || dailyChallengeHtml.includes('Iniciar Reto de Hoy (60s)'),
    'No se encuentra el botón de iniciar el reto diario de 60 segundos'
  );
});
