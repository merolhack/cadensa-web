import { describe, it, expect } from 'vitest';
import {
  DDK_SEQUENCES,
  evaluateDDKTrial,
} from './diadochokinesis';

describe('diadochokinesis engine', () => {
  it('debe tener registradas las secuencias estándar fonoaudiológicas', () => {
    expect(DDK_SEQUENCES['pa-ta-ka']).toBeDefined();
    expect(DDK_SEQUENCES['ba-da-ga']).toBeDefined();
    expect(DDK_SEQUENCES['tra-kla-pra']).toBeDefined();
    expect(DDK_SEQUENCES['pa-pa-pa']).toBeDefined();
    expect(DDK_SEQUENCES['pa-ta-ka'].syllables).toEqual(['pa', 'ta', 'ka']);
  });

  it('debe calcular métricas óptimas ante emisión regular y rápida', () => {
    // 50 sílabas en 10 segundos (~5.0 síl/s) a intervalos constantes de 200ms
    const timestamps: number[] = [];
    for (let i = 0; i < 50; i++) {
      timestamps.push(i * 200);
    }

    const result = evaluateDDKTrial('pa-ta-ka', timestamps, 10);

    expect(result.syllableCount).toBe(50);
    expect(result.durationSeconds).toBe(10);
    expect(result.rateSyllablesPerSecond).toBe(5.0);
    expect(result.averageIntervalMs).toBe(200);
    expect(result.jitterMs).toBe(0);
    expect(result.rateClassification).toBe('Óptima');
    expect(result.regularityClassification).toBe('Muy Regular');
    expect(result.clinicalSummary).toContain('Excelente coordinación');
  });

  it('debe clasificar disritmia cuando la dispersión inter-silábica es alta (>60ms)', () => {
    // Tiempos irregulares
    const timestamps = [0, 150, 450, 600, 1000, 1150, 1600];
    const result = evaluateDDKTrial('ba-da-ga', timestamps, 5);

    expect(result.jitterMs).toBeGreaterThan(60);
    expect(result.regularityClassification).toBe('Disritmia / Irregular');
    expect(result.clinicalSummary).toContain('fluctuaciones temporales');
  });

  it('debe manejar casos borde con pocas sílabas registradas', () => {
    const result = evaluateDDKTrial('pa-ta-ka', [100], 10);
    expect(result.syllableCount).toBe(1);
    expect(result.rateClassification).toBe('Lenta');
    expect(result.clinicalSummary).toContain('Registro insuficiente');
  });
});

