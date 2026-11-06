import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from '../../src/app/page.js';

let homeHtml: string = '';
let practiceHtml: string = '';

Given('que el usuario accede a la página de inicio de Cadensa con diseño simplificado', function () {
  const element = React.createElement(Home as React.ComponentType<{ initialView?: 'home' | 'practice' }>, { initialView: 'home' });
  homeHtml = renderToString(element);
});

Then('se presenta un llamado a la acción principal para {string}', function (ctaText: string) {
  assert.ok(
    homeHtml.includes(ctaText),
    `El HTML no contiene el llamado a la acción principal esperado: ${ctaText}`
  );
});

Then('se ofrece el acceso directo a {string} para el público infantil', function (kidsText: string) {
  assert.ok(
    homeHtml.includes(kidsText),
    `El HTML no contiene el botón de acceso infantil esperado: ${kidsText}`
  );
});

Then('el laboratorio clínico y sus 9 módulos especializados se agrupan en un panel colapsable', function () {
  assert.ok(
    homeHtml.includes('Laboratorio Clínico y Herramientas Especializadas') || homeHtml.includes('Laboratorio y Herramientas Clínicas'),
    'El HTML de inicio no contiene el encabezado del panel colapsable de laboratorio'
  );
  assert.ok(
    homeHtml.includes('9 Módulos') || homeHtml.includes('Simulador Real'),
    'El HTML de inicio no contiene las herramientas agrupadas en el laboratorio'
  );
});

Given('que el usuario explora las tarjetas de técnicas clínicas en el catálogo', function () {
  const element = React.createElement(Home as React.ComponentType<{ initialView?: 'home' | 'practice' }>, { initialView: 'home' });
  homeHtml = renderToString(element);
});

Then('cada tarjeta dispone de un componente Disclosure para {string}', function (disclosureSummary: string) {
  assert.ok(
    homeHtml.includes(disclosureSummary),
    `Las tarjetas de técnica no contienen el componente Disclosure con texto: ${disclosureSummary}`
  );
});

Then('los detalles neurobiológicos se muestran bajo demanda sin saturar la vista inicial', function () {
  assert.ok(
    homeHtml.includes('<details') && homeHtml.includes('<summary'),
    'El HTML no renderiza la estructura semántica de divulgación <details>/<summary>'
  );
});

Given('que el usuario ingresa a la estación de entrenamiento rítmico', function () {
  const element = React.createElement(Home as React.ComponentType<{ initialView?: 'home' | 'practice' }>, { initialView: 'practice' });
  practiceHtml = renderToString(element);
});

Then('los controles de tempo y timbres se organizan dentro de un panel Collapsible', function () {
  assert.ok(
    practiceHtml.includes('Ajustes de Cadencia, Sonido y Accesibilidad'),
    'La vista de práctica no contiene el panel colapsable de ajustes de cadencia y sonido'
  );
});

Then('se dispone de interruptores Toggle para el sonido acústico, vibración háptica y reto de silencio', function () {
  assert.ok(
    practiceHtml.includes('Sonido Acústico'),
    'No se encuentra el toggle de Sonido Acústico en los ajustes'
  );
  assert.ok(
    practiceHtml.includes('Vibración Háptica'),
    'No se encuentra el toggle de Vibración Háptica en los ajustes'
  );
  assert.ok(
    practiceHtml.includes('Reto Silencio Fading'),
    'No se encuentra el toggle de Reto Silencio Fading en los ajustes'
  );
  assert.ok(
    practiceHtml.includes('role="switch"'),
    'No se encuentra el atributo accesible role="switch" para los componentes Toggle'
  );
});

Then('las herramientas de auto-escucha y validación fonética se presentan en su contenedor ergonómico', function () {
  assert.ok(
    practiceHtml.includes('Herramientas de Auto-Escucha y Validación Fonética'),
    'No se encuentra el contenedor colapsable de herramientas de auto-escucha y validación fonética'
  );
  assert.ok(
    practiceHtml.includes('Auto-Escucha Fonoaudiológica'),
    'No se encuentra el módulo de Auto-Escucha dentro de la práctica'
  );
});

