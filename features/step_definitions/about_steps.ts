import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import AboutPage from '../../src/app/about/page.js';

let aboutHtml: string = '';

Given('que el usuario navega a la página Acerca de', function () {
  const element = React.createElement(AboutPage);
  aboutHtml = renderToString(element);
});

Then('se debe mostrar el título principal {string}', function (title: string) {
  assert.ok(aboutHtml.includes(title), `No se encontró el título esperado: ${title}`);
});

Then('se deben detallar los pilares clínicos del método Habla Rítmica Silábica \\(STS\\)', function () {
  assert.ok(aboutHtml.includes('Base Neurobiológica (STS)'), 'No se encontró la base neurobiológica');
  assert.ok(aboutHtml.includes('Syllable-Timed Speech (STS)'), 'No se encontró la mención de STS');
});

Then('se debe presentar la sección de hitos completados y futuros pasos del roadmap', function () {
  assert.ok(aboutHtml.includes('Hitos Completados y Operativos'), 'No se encontraron los hitos completados');
  assert.ok(aboutHtml.includes('Futuros Pasos en Desarrollo Activo'), 'No se encontraron los futuros pasos');
});

Given('que el usuario consulta la información del autor en la página Acerca de', function () {
  if (!aboutHtml) {
    const element = React.createElement(AboutPage);
    aboutHtml = renderToString(element);
  }
});

Then('se debe mostrar el nombre del autor {string}', function (authorName: string) {
  assert.ok(aboutHtml.includes(authorName), `No se encontró el nombre del autor: ${authorName}`);
});

Then('debe contar con un enlace directo a su página en GitHub Pages {string}', function (ghPagesUrl: string) {
  assert.ok(aboutHtml.includes(`href="${ghPagesUrl}"`), `No se encontró el enlace a GitHub Pages: ${ghPagesUrl}`);
});

Then('debe contar con un enlace directo a su perfil de LinkedIn {string}', function (linkedinUrl: string) {
  assert.ok(aboutHtml.includes(`href="${linkedinUrl}"`), `No se encontró el enlace a LinkedIn: ${linkedinUrl}`);
});

Then('debe contar con un enlace a su repositorio en GitHub {string}', function (githubUrl: string) {
  assert.ok(aboutHtml.includes(`href="${githubUrl}"`), `No se encontró el enlace a GitHub: ${githubUrl}`);
});

Given('que el usuario revisa la hoja de ruta en la página Acerca de', function () {
  if (!aboutHtml) {
    const element = React.createElement(AboutPage);
    aboutHtml = renderToString(element);
  }
});

Then('se debe indicar la regla de sincronización mandatoria con el ROADMAP y LLM Wiki', function () {
  assert.ok(
    aboutHtml.includes('Sincronización Mandatoria • AGENTS & Wiki') ||
    aboutHtml.includes('Compromiso de Transparencia Técnica'),
    'No se encontró la mención de la regla de sincronización con el ROADMAP y LLM Wiki'
  );
});
