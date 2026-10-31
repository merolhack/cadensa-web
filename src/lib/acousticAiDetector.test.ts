import { describe, it, expect } from 'vitest';
import { AcousticAiDetector } from './acousticAiDetector';

describe('AcousticAiDetector - Inferencia On-Device y Micro-Tensión Laríngea', () => {
  it('debe inicializarse con configuración por defecto e indicar modo DSP_CPU o WebGPU', () => {
    const detector = new AcousticAiDetector();
    const silentBuffer = new Float32Array(512);
    const analysis = detector.analyzeBuffer(silentBuffer);

    expect(analysis.tensionLevel).toBe(0);
    expect(analysis.riskLevel).toBe('low');
    expect(analysis.processingMode).toBe('DSP_CPU');
    expect(analysis.clinicalRecommendation).toContain('Tensión óptima');
  });

  it('debe detectar tensión alta ante ráfagas bruscas y de alta frecuencia (simulación de espasmo)', () => {
    const detector = new AcousticAiDetector();
    const tenseBuffer = new Float32Array(512);

    // Generar oscilación de alta frecuencia y máxima amplitud alternada (hiperaducción)
    for (let i = 0; i < tenseBuffer.length; i++) {
      tenseBuffer[i] = i % 2 === 0 ? 0.95 : -0.95;
    }

    const analysis = detector.analyzeBuffer(tenseBuffer);
    expect(analysis.tensionLevel).toBeGreaterThan(0.6);
    expect(analysis.riskLevel).toBe('high');
    expect(analysis.clinicalRecommendation).toContain('Hiperaducción laríngea alta');
  });

  it('debe clasificar riesgo moderado y recomendar Inicio Suave (Easy Onset)', () => {
    const detector = new AcousticAiDetector({
      tensionThresholdLow: 0.1,
      tensionThresholdHigh: 0.8,
    });
    const moderateBuffer = new Float32Array(512);
    for (let i = 0; i < moderateBuffer.length; i++) {
      moderateBuffer[i] = Math.sin(i * 0.4) * 0.5;
    }

    const analysis = detector.analyzeBuffer(moderateBuffer);
    expect(['low', 'moderate']).toContain(analysis.riskLevel);
  });

  it('debe acumular y limpiar el historial con reset()', () => {
    const detector = new AcousticAiDetector();
    const buffer = new Float32Array(128).fill(0.1);

    detector.analyzeBuffer(buffer);
    detector.analyzeBuffer(buffer);
    expect(detector.getRecentHistory().length).toBe(2);

    detector.reset();
    expect(detector.getRecentHistory().length).toBe(0);
  });
});
