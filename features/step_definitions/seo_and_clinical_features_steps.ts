import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PrivacyPage from '../../src/app/privacy/page.js';
import TermsPage from '../../src/app/terms/page.js';
import { RealWorldSimulator } from '../../src/components/RealWorldSimulator.js';
import { QuickDailyRoutine } from '../../src/components/QuickDailyRoutine.js';
import { Footer } from '../../src/components/Footer.js';
import { AcousticAiDetector } from '../../src/lib/acousticAiDetector.js';
import { DIALECT_PRESETS } from '../../src/lib/phoneticPresets.js';

let privacyHtml = '';
let termsHtml = '';
let simulatorHtml = '';
let routineHtml = '';
let footerHtml = '';
let aiDetector: AcousticAiDetector;

Given('que el usuario visita los términos clínicos y políticas de Cadensa', function () {
  privacyHtml = renderToString(React.createElement(PrivacyPage));
  termsHtml = renderToString(React.createElement(TermsPage));
});

Then('debe visualizar el aviso de procesamiento Zero Trust de audio en el navegador', function () {
  assert.ok(
    privacyHtml.includes('Procesamiento Local de Voz') || privacyHtml.includes('Web Audio API'),
    'No se encontró la mención de procesamiento Zero Trust'
  );
});

Then('debe contar con el descargo de responsabilidad médica fonoaudiológica', function () {
  assert.ok(
    termsHtml.includes('Descargo de Responsabilidad Fonoaudiológica y Médica') ||
    termsHtml.includes('NO constituyen consejo médico'),
    'No se encontró el descargo médico YMYL'
  );
});

Then('debe declararse la identificación de AdSense {string}', function (pubId: string) {
  assert.ok(
    privacyHtml.includes(pubId),
    `No se encontró el Publisher ID de AdSense: ${pubId}`
  );
});

Given('que el usuario abre el simulador de situaciones cotidianas', function () {
  simulatorHtml = renderToString(
    React.createElement(RealWorldSimulator, {
      isOpen: true,
      onClose: () => {},
      onSelectPracticePhrase: () => {},
    })
  );
});

Then('se deben listar escenarios como llamadas telefónicas y pedidos en restaurante', function () {
  assert.ok(
    simulatorHtml.includes('Llamada para Cita Médica') || simulatorHtml.includes('Pedido en Restaurante'),
    'No se encontraron los escenarios cotidianos esperados'
  );
});

Then('al seleccionar una respuesta guiada se debe configurar la técnica fonoaudiológica correspondiente', function () {
  assert.ok(
    simulatorHtml.includes('Técnica recomendada:'),
    'No se encontró la recomendación de técnica'
  );
});

Given('que el usuario inicia la rutina guiada diaria', function () {
  routineHtml = renderToString(
    React.createElement(QuickDailyRoutine, {
      isOpen: true,
      onClose: () => {},
      onStartFullPractice: () => {},
    })
  );
});

Then('debe comenzar con el bloque de respiración diafragmática 4-4-4-4', function () {
  assert.ok(
    routineHtml.includes('Respiración Diafragmática') || routineHtml.includes('4-4-4-4'),
    'No se encontró el bloque inicial de respiración'
  );
});

Then('debe permitir el avance hacia el Inicio Vocal Suave y el Habla Rítmica Silábica', function () {
  assert.ok(
    routineHtml.includes('Paso 1 de 3') || routineHtml.includes('Siguiente Paso'),
    'No se encontró el flujo de avance de la rutina'
  );
});

Given('que el usuario o un motor de búsqueda inspecciona el pie de página global', function () {
  footerHtml = renderToString(React.createElement(Footer));
});

Then('debe contener enlaces directos a las 7 técnicas fonoaudiológicas clínicas', function () {
  const techniques = [
    '/tecnicas/sts',
    '/tecnicas/easy_onset',
    '/tecnicas/light_contact',
    '/tecnicas/prolonged_speech',
    '/tecnicas/box_breathing',
    '/tecnicas/pull_out',
    '/tecnicas/cancellation',
  ];
  for (const tech of techniques) {
    assert.ok(footerHtml.includes(tech), `El footer no contiene el enlace a ${tech}`);
  }
});

Then('debe incluir el aviso fonoaudiológico YMYL y enlaces a privacidad y términos', function () {
  assert.ok(footerHtml.includes('Aviso Fonoaudiológico YMYL'), 'Falta el aviso YMYL');
  assert.ok(footerHtml.includes('/privacy'), 'Falta enlace a privacidad');
  assert.ok(footerHtml.includes('/terms'), 'Falta enlace a términos');
});

Given('que el paciente o terapeuta abre el módulo de biofeedback acústico on-device', function () {
  aiDetector = new AcousticAiDetector();
});

Then('debe evaluar la tensión prefonatoria y clasificar el riesgo de bloqueo', function () {
  const buffer = new Float32Array(256).fill(0.1);
  const analysis = aiDetector.analyzeBuffer(buffer);
  assert.ok(typeof analysis.tensionLevel === 'number');
  assert.ok(['low', 'moderate', 'high'].includes(analysis.riskLevel));
  assert.ok(analysis.clinicalRecommendation.length > 0);
});

Then('al consultar los presets dialectales debe ofrecer parámetros de tempo para México, Cono Sur, Andino, Caribe y Peninsular', function () {
  const regions = ['mexico_central', 'cono_sur', 'andino', 'caribe', 'iberico'];
  for (const reg of regions) {
    const preset = DIALECT_PRESETS[reg];
    assert.ok(preset, `Falta preset para ${reg}`);
    assert.ok(preset.recommendedTempoBpm >= 70 && preset.recommendedTempoBpm <= 90);
  }
});
