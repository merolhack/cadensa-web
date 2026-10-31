import { describe, it, expect } from 'vitest';
import { DIALECT_PRESETS, getDialectPreset } from './phoneticPresets';

describe('phoneticPresets - Calibración Fonoaudiológica Dialectal', () => {
  it('debe contener los 5 presets regionales clave', () => {
    expect(DIALECT_PRESETS.mexico_central).toBeDefined();
    expect(DIALECT_PRESETS.cono_sur).toBeDefined();
    expect(DIALECT_PRESETS.andino).toBeDefined();
    expect(DIALECT_PRESETS.caribe).toBeDefined();
    expect(DIALECT_PRESETS.iberico).toBeDefined();
  });

  it('debe retornar mexico_central ante un dialecto desconocido', () => {
    const fallback = getDialectPreset('desconocido');
    expect(fallback.id).toBe('mexico_central');
    expect(fallback.flag).toBe('🇲🇽');
  });

  it('debe tener valores válidos de BPM y formantes para cada dialecto', () => {
    Object.values(DIALECT_PRESETS).forEach((preset) => {
      expect(preset.recommendedTempoBpm).toBeGreaterThanOrEqual(70);
      expect(preset.recommendedTempoBpm).toBeLessThanOrEqual(90);
      expect(preset.vowelFormants.a.f1).toBeGreaterThan(600);
      expect(preset.vowelFormants.i.f2).toBeGreaterThan(2000);
    });
  });
});
