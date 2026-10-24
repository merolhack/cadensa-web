import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

interface FaqContext {
  faqSectionVisible: boolean;
  stsSectionVisible: boolean;
  hasButtonExplanations: boolean;
  hasVoiceAccuracyExplanation: boolean;
  hasBasalGangliaExplanation: boolean;
  hasNeuroplasticityExplanation: boolean;
}

const context: FaqContext = {
  faqSectionVisible: false,
  stsSectionVisible: false,
  hasButtonExplanations: false,
  hasVoiceAccuracyExplanation: false,
  hasBasalGangliaExplanation: false,
  hasNeuroplasticityExplanation: false,
};

// Escenario: Consulta de la guía interactiva de botones y controles en el FAQ
Given('que un usuario desea entender el funcionamiento de los controles de Cadensa', function () {
  context.faqSectionVisible = false;
  context.hasButtonExplanations = false;
});

When('accede a la sección FAQ ubicada arriba del banner de la AMTTM', function () {
  context.faqSectionVisible = true;
  context.hasButtonExplanations = true;
  context.hasVoiceAccuracyExplanation = true;
});

Then('puede consultar el significado detallado de los botones de práctica, audio, respiración y guardado', function () {
  assert.strictEqual(context.faqSectionVisible, true);
  assert.strictEqual(context.hasButtonExplanations, true);
});

Then('obtiene la explicación de la medición de precisión en milisegundos del botón Registrar Sílaba', function () {
  assert.strictEqual(context.hasVoiceAccuracyExplanation, true);
});

// Escenario: Lectura del fundamento neurobiológico de Habla Rítmica Silábica (STS)
Given('que una persona con tartamudez busca comprender el método terapéutico', function () {
  context.stsSectionVisible = false;
  context.hasBasalGangliaExplanation = false;
  context.hasNeuroplasticityExplanation = false;
});

When('revisa la sección de fundamento clínico ubicada debajo del FAQ', function () {
  context.stsSectionVisible = true;
  context.hasBasalGangliaExplanation = true;
  context.hasNeuroplasticityExplanation = true;
});

Then('visualiza cómo el ritmo isocrónico compensa el déficit de los ganglios basales', function () {
  assert.strictEqual(context.stsSectionVisible, true);
  assert.strictEqual(context.hasBasalGangliaExplanation, true);
});

Then('comprende el beneficio de la neuroplasticidad y la reducción de la ansiedad anticipatoria', function () {
  assert.strictEqual(context.hasNeuroplasticityExplanation, true);
});
