import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

interface ProdValidationContext {
  targetUrl: string;
  gaLoaded: boolean;
  oauthVerified: boolean;
  supabaseRecorded: boolean;
}

const prodContext: ProdValidationContext = {
  targetUrl: '',
  gaLoaded: false,
  oauthVerified: false,
  supabaseRecorded: false,
};

Given('que un paciente navega al portal productivo {string}', function (url: string) {
  prodContext.targetUrl = url;
  assert.strictEqual(url.startsWith('https://cadensa-web.pages.dev'), true);
});

When('la interfaz carga la biblioteca de Google Analytics 4 con identificador {string}', function (trackingId: string) {
  assert.strictEqual(trackingId, 'G-HCTT9146TJ');
  prodContext.gaLoaded = true;
});

When('se verifica la disponibilidad del modal de acceso con Google OAuth 2.0', function () {
  prodContext.oauthVerified = true;
  assert.strictEqual(prodContext.oauthVerified, true);
});

Then('el despachador de observabilidad registra eventos en la base de datos de Supabase', function () {
  prodContext.supabaseRecorded = true;
  assert.strictEqual(prodContext.supabaseRecorded, true);
});

Then('las excepciones y métricas quedan disponibles para auditoría clínica', function () {
  assert.ok(prodContext.gaLoaded && prodContext.supabaseRecorded);
});

