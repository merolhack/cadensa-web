import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import {
  CLINICAL_TECHNIQUES,
  TECHNIQUE_FAMILIES,
  TechniqueId,
  ClinicalTechnique,
} from '../../src/lib/clinicalTechniques';

interface TechniqueMenuContext {
  menuOpened: boolean;
  selectedTechnique: ClinicalTechnique | null;
  rampActive: boolean;
  faqTabSelected: string | null;
}

const context: TechniqueMenuContext = {
  menuOpened: false,
  selectedTechnique: null,
  rampActive: false,
  faqTabSelected: null,
};

// Escenario: Apertura del Menú Modular y visualización de familias clínicas
Given('que el usuario se encuentra en la pantalla principal de Cadensa', function () {
  context.menuOpened = false;
  context.selectedTechnique = CLINICAL_TECHNIQUES.sts;
});

When('abre el menú modular de técnicas desde la barra superior', function () {
  context.menuOpened = true;
});

Then('se despliegan las 3 familias fonoaudiológicas: Modelado de Fluidez, Control Fisiológico y Modificación de Bloqueos', function () {
  assert.strictEqual(context.menuOpened, true);
  assert.strictEqual(TECHNIQUE_FAMILIES.length, 3);
  const ids = TECHNIQUE_FAMILIES.map((f) => f.id);
  assert.strictEqual(ids.includes('fluency_shaping'), true);
  assert.strictEqual(ids.includes('physiological'), true);
  assert.strictEqual(ids.includes('stuttering_modification'), true);
});

Then('puede visualizar cada técnica con su icono, nivel de dificultad y objetivo clínico', function () {
  const allTechs = Object.values(CLINICAL_TECHNIQUES);
  assert.strictEqual(allTechs.length >= 7, true);
  allTechs.forEach((t) => {
    assert.strictEqual(Boolean(t.icon), true);
    assert.strictEqual(Boolean(t.difficulty), true);
    assert.strictEqual(Boolean(t.clinicalObjective), true);
  });
});

// Escenario: Activación de la técnica Inicio Vocal Suave (Easy Onset)
Given('que el usuario tiene dificultad con el ataque glótico duro en palabras con vocal', function () {
  context.selectedTechnique = null;
  context.rampActive = false;
});

When(/^selecciona la técnica "Inicio Vocal Suave \(Easy Onset\)"$/, function () {
  context.selectedTechnique = CLINICAL_TECHNIQUES.easy_onset;
  context.rampActive = context.selectedTechnique.visualMode === 'smooth_ramp';
});

Then('el área de práctica activa la rampa visual de fonación progresiva', function () {
  assert.strictEqual(context.selectedTechnique?.id, 'easy_onset');
  assert.strictEqual(context.rampActive, true);
});

Then('el sistema guía una aspiración suave previa antes de alcanzar la voz plena', function () {
  const steps = context.selectedTechnique?.practicalSteps || [];
  assert.strictEqual(steps.length > 0, true);
  assert.strictEqual(steps[0].includes('exhalación silenciosa') || steps[0].includes('suspiro'), true);
});

// Escenario: Consulta de FAQ y fundamento clínico especializado por técnica
Given('que el usuario desea aprender cómo aplicar la técnica Contacto Articular Suave', function () {
  context.faqTabSelected = null;
});

When('selecciona la pestaña de la técnica en la sección FAQ', function () {
  context.faqTabSelected = 'light_contact';
});

Then('visualiza las instrucciones prácticas paso a paso', function () {
  const tech = CLINICAL_TECHNIQUES[context.faqTabSelected as TechniqueId];
  assert.strictEqual(tech.practicalSteps.length >= 3, true);
});

Then('tiene acceso a las respuestas sobre reducción de presión en consonantes oclusivas', function () {
  const tech = CLINICAL_TECHNIQUES[context.faqTabSelected as TechniqueId];
  const hasOcclusivesFaq = tech.faqItems.some((f) => f.question.toLowerCase().includes('p, t') || f.answer.toLowerCase().includes('oclusivas'));
  assert.strictEqual(hasOcclusivesFaq, true);
});
