import { Given, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { CLINICAL_TECHNIQUES, ClinicalTechnique } from '../../src/lib/clinicalTechniques';

interface DifferentiationContext {
  activeTech: ClinicalTechnique | null;
}

const diffContext: DifferentiationContext = {
  activeTech: null,
};

Given('que la técnica activa es {string}', function (nombreTecnica: string) {
  const found = Object.values(CLINICAL_TECHNIQUES).find((t) => t.name === nombreTecnica);
  assert.ok(found, `Técnica no encontrada en catálogo clínico: ${nombreTecnica}`);
  diffContext.activeTech = found;
});

Then('la técnica se clasifica como rítmica con metrónomo activo', function () {
  assert.strictEqual(diffContext.activeTech?.isRhythmic, true);
});

Then('la técnica no utiliza metrónomo rítmico rígido', function () {
  assert.strictEqual(diffContext.activeTech?.isRhythmic, false);
});

Then('el botón de acción principal indica {string}', function (textoBoton: string) {
  assert.strictEqual(diffContext.activeTech?.actionButton.start, textoBoton);
});

Then('la tarjeta clínica 01 expone el mecanismo de {string}', function (mecanismo: string) {
  assert.strictEqual(diffContext.activeTech?.badge, mecanismo);
});

Then('la tarjeta clínica 01 expone {string}', function (badgeEsperado: string) {
  assert.strictEqual(diffContext.activeTech?.badge, badgeEsperado);
});

Then('la categoría recomendada de práctica se enfoca en {string}', function (categoriaEsperada: string) {
  assert.strictEqual(diffContext.activeTech?.recommendedCategory, categoriaEsperada);
});
