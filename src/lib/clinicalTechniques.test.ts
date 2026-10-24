import { describe, it, expect } from 'vitest';
import {
  CLINICAL_TECHNIQUES,
  TECHNIQUE_FAMILIES,
  getTechniquesByFamily,
  TechniqueId,
} from './clinicalTechniques';

describe('Clinical Techniques Catalog - Unit Tests', () => {
  it('debe contener todas las técnicas requeridas con sus metadatos clínicos', () => {
    const requiredTechniques: TechniqueId[] = [
      'sts',
      'easy_onset',
      'light_contact',
      'prolonged_speech',
      'box_breathing',
      'pull_out',
      'cancellation',
    ];

    requiredTechniques.forEach((id) => {
      const tech = CLINICAL_TECHNIQUES[id];
      expect(tech).toBeDefined();
      expect(tech.name).toBeTruthy();
      expect(tech.clinicalObjective).toBeTruthy();
      expect(tech.neurobiologicalBasis).toBeTruthy();
      expect(tech.practicalSteps.length).toBeGreaterThanOrEqual(3);
      expect(tech.faqItems.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('debe estructurar las familias clínicas correctamente', () => {
    expect(TECHNIQUE_FAMILIES.length).toBe(3);
    const familyIds = TECHNIQUE_FAMILIES.map((f) => f.id);
    expect(familyIds).toContain('fluency_shaping');
    expect(familyIds).toContain('physiological');
    expect(familyIds).toContain('stuttering_modification');
  });

  it('debe agrupar las técnicas por familia mediante getTechniquesByFamily()', () => {
    const grouped = getTechniquesByFamily();
    expect(grouped.length).toBe(3);

    const fluencyFam = grouped.find((f) => f.id === 'fluency_shaping');
    expect(fluencyFam).toBeDefined();
    expect(fluencyFam?.techniqueItems.length).toBe(4);
    expect(fluencyFam?.techniqueItems.map((t) => t.id)).toContain('sts');
    expect(fluencyFam?.techniqueItems.map((t) => t.id)).toContain('easy_onset');
  });

  it('cada técnica debe incluir preguntas frecuentes (FAQ) detalladas con badge', () => {
    Object.values(CLINICAL_TECHNIQUES).forEach((tech) => {
      tech.faqItems.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.badge).toBeTruthy();
      });
    });
  });
});
