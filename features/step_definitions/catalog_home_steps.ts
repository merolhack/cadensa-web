import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from '../../src/app/page.js';
import { CLINICAL_TECHNIQUES, TECHNIQUE_FAMILIES } from '../../src/lib/clinicalTechniques.js';
import { TechniqueVideoModal } from '../../src/components/TechniqueVideoModal.js';

let homeHtml: string = '';
let practiceHtml: string = '';
let videoModalHtml: string = '';

Given('que el usuario accede a la página principal de Cadensa', function () {
  const element = React.createElement(Home as React.ComponentType<{ initialView?: 'home' | 'practice' }>, { initialView: 'home' });
  homeHtml = renderToString(element);
});

Then('se debe presentar el catálogo con 7 tarjetas de técnicas clínicas', function () {
  const techniqueList = Object.values(CLINICAL_TECHNIQUES);
  assert.strictEqual(techniqueList.length, 7, 'Deben existir 7 técnicas fonoaudiológicas registradas');

  for (const tech of techniqueList) {
    assert.ok(
      homeHtml.includes(tech.name),
      `El catálogo de inicio no contiene la técnica: ${tech.name}`
    );
  }
});

Then('deben estar disponibles los filtros por familia terapéutica', function () {
  for (const family of TECHNIQUE_FAMILIES) {
    assert.ok(
      homeHtml.includes(family.shortName),
      `El HTML no contiene el filtro de familia: ${family.shortName}`
    );
  }
});

Then('cada tarjeta debe incluir opciones para {string} y {string}', function (op1: string, op2: string) {
  assert.ok(
    homeHtml.includes(op1),
    `El HTML no contiene la opción esperada: ${op1}`
  );
  assert.ok(
    homeHtml.includes(op2),
    `El HTML no contiene la opción esperada: ${op2}`
  );
});

Given('que el usuario navega a la estación de práctica de una técnica', function () {
  const element = React.createElement(Home as React.ComponentType<{ initialView?: 'home' | 'practice' }>, { initialView: 'practice' });
  practiceHtml = renderToString(element);
});

Then('la interfaz de práctica debe mostrar el botón de navegación {string}', function (btnLabel: string) {
  assert.ok(
    practiceHtml.includes(btnLabel),
    `La vista de práctica no incluye el botón de navegación esperado: ${btnLabel}`
  );
});

Then('debe contar con un botón {string} para consultar la guía audiovisual técnica en cualquier momento', function (videoBtnLabel: string) {
  assert.ok(
    practiceHtml.includes(videoBtnLabel),
    `La vista de práctica no incluye el botón audiovisual: ${videoBtnLabel}`
  );
});

Given('que el usuario solicita ver el video explicativo de una técnica clínica', function () {
  const sampleTechnique = CLINICAL_TECHNIQUES.sts;
  const element = React.createElement(TechniqueVideoModal, {
    technique: sampleTechnique,
    isOpen: true,
    onClose: () => {},
    onStartPractice: () => {},
  });
  videoModalHtml = renderToString(element);
});

Then('el sistema debe desplegar el modal interactivo de video con el protocolo fisiológico', function () {
  assert.ok(
    videoModalHtml.includes('Video Demostrativo'),
    'El modal no incluye el contenedor de video demostrativo'
  );
  assert.ok(
    videoModalHtml.includes('Protocolo Fisiológico Clave'),
    'El modal no expone los pasos del protocolo fisiológico clave'
  );
});

Then('debe permitir comenzar el entrenamiento directamente desde el modal', function () {
  assert.ok(
    videoModalHtml.includes('Comenzar Práctica'),
    'El modal no ofrece la acción para iniciar el entrenamiento guiado'
  );
});
