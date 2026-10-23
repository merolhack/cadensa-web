import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Home from '../../src/app/page.js';

let renderedHtml: string = '';

Given('que el usuario visita la página de inicio de Cadensa', function () {
  const element = React.createElement(Home);
  renderedHtml = renderToString(element);
});

Then('el título principal debe contener {string}', function (expectedTitle: string) {
  assert.ok(
    renderedHtml.includes(expectedTitle),
    `El HTML no contiene el título esperado: ${expectedTitle}`
  );
});

Then('el lema debe mostrar {string}', function (expectedTagline: string) {
  assert.ok(
    renderedHtml.includes(expectedTagline),
    `El HTML no contiene el lema esperado: ${expectedTagline}`
  );
});

Then('debe existir una referencia al concepto clínico de {string}', function (expectedConcept: string) {
  assert.ok(
    renderedHtml.toLowerCase().includes(expectedConcept.toLowerCase()),
    `El HTML no contiene el concepto clínico esperado: ${expectedConcept}`
  );
});

Then('debe indicarse el estado del proyecto como {string}', function (expectedBadge: string) {
  assert.ok(
    renderedHtml.includes(expectedBadge),
    `El HTML no contiene el estado esperado: ${expectedBadge}`
  );
});
