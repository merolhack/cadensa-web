import { describe, it, expect, beforeEach } from 'vitest';
import {
  AcousticBlockDetector,
  DEFAULT_ACOUSTIC_CONFIG,
  type AcousticAnalysisFrame,
} from './acousticBlockDetector';

describe('AcousticBlockDetector - Unit Tests', () => {
  let detector: AcousticBlockDetector;

  beforeEach(() => {
    detector = new AcousticBlockDetector({
      blockMinDurationMs: 300,
      prolongationMinDurationMs: 250,
      repetitionMaxIntervalMs: 200,
    });
  });

  it('debe inicializarse con configuración por defecto o personalizada', () => {
    const defaultDet = new AcousticBlockDetector();
    expect(defaultDet).toBeDefined();
    expect(DEFAULT_ACOUSTIC_CONFIG.blockMinDurationMs).toBe(350);
  });

  it('extractFrame debe calcular RMS energy y zero crossing rate correctamente de un buffer PCM', () => {
    // Señal senoidal simulada
    const sampleRate = 44100;
    const samples = new Float32Array(512);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5;
    }

    const frame = detector.extractFrame(samples, sampleRate);

    expect(frame.rmsEnergy).toBeGreaterThan(0.3);
    expect(frame.zeroCrossingRate).toBeGreaterThan(0);
    expect(frame.isVoiced).toBe(true);
  });

  it('extractFrame debe identificar silencio como isVoiced false', () => {
    const silentSamples = new Float32Array(512); // Puros ceros
    const frame = detector.extractFrame(silentSamples);

    expect(frame.rmsEnergy).toBe(0);
    expect(frame.isVoiced).toBe(false);
  });

  it('debe detectar un bloqueo tónico cuando hay esfuerzo articulatorio sin fonación sostenida', () => {
    detector.setArticulatoryEffort(true);

    const silentFrame: AcousticAnalysisFrame = {
      timestamp: Date.now(),
      rmsEnergy: 0.005,
      zeroCrossingRate: 0.01,
      spectralCentroid: 200,
      isVoiced: false,
    };

    let detectedEvent = null;
    // Simular 320ms de silencio bajo esfuerzo (16 cuadros de 20ms)
    for (let i = 0; i < 16; i++) {
      const event = detector.processFrame(silentFrame, 20);
      if (event) {
        detectedEvent = event;
      }
    }

    expect(detectedEvent).not.toBeNull();
    expect(detectedEvent?.type).toBe('TONIC_BLOCK');
    expect(detectedEvent?.durationMs).toBeGreaterThanOrEqual(300);
    expect(detectedEvent?.message).toContain('Bloqueo tónico');
  });

  it('no debe disparar bloqueo tónico si no hay esfuerzo articulatorio', () => {
    detector.setArticulatoryEffort(false);

    const silentFrame: AcousticAnalysisFrame = {
      timestamp: Date.now(),
      rmsEnergy: 0.005,
      zeroCrossingRate: 0.01,
      spectralCentroid: 200,
      isVoiced: false,
    };

    let detectedEvent = null;
    for (let i = 0; i < 20; i++) {
      const event = detector.processFrame(silentFrame, 20);
      if (event) detectedEvent = event;
    }

    expect(detectedEvent).toBeNull();
  });

  it('debe detectar una prolongación involuntaria cuando la fonación es sostenida y constante', () => {
    const prolongedFrame: AcousticAnalysisFrame = {
      timestamp: Date.now(),
      rmsEnergy: 0.25,
      zeroCrossingRate: 0.05,
      spectralCentroid: 500,
      isVoiced: true,
    };

    let detectedEvent = null;
    // Simular 300ms de fonación sostenida y uniforme (15 cuadros de 20ms)
    for (let i = 0; i < 15; i++) {
      const event = detector.processFrame(prolongedFrame, 20);
      if (event) {
        detectedEvent = event;
      }
    }

    expect(detectedEvent).not.toBeNull();
    expect(detectedEvent?.type).toBe('PROLONGATION');
    expect(detectedEvent?.durationMs).toBeGreaterThanOrEqual(250);
  });

  it('debe resetear acumuladores y estado al llamar a reset()', () => {
    detector.setArticulatoryEffort(true);
    detector.reset();

    const silentFrame: AcousticAnalysisFrame = {
      timestamp: Date.now(),
      rmsEnergy: 0.005,
      zeroCrossingRate: 0.01,
      spectralCentroid: 200,
      isVoiced: false,
    };

    const event = detector.processFrame(silentFrame, 20);
    expect(event).toBeNull();
  });
});
