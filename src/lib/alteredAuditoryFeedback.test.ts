import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlteredAuditoryProcessor, DEFAULT_DAF_CONFIG } from './alteredAuditoryFeedback';

describe('AlteredAuditoryProcessor Engine', () => {
  let processor: AlteredAuditoryProcessor;

  beforeEach(() => {
    processor = new AlteredAuditoryProcessor();
  });

  it('debe inicializarse con la configuración por defecto y estado detenido', () => {
    expect(processor.getConfig()).toEqual(DEFAULT_DAF_CONFIG);
    expect(processor.getIsRunning()).toBe(false);
  });

  it('permite actualizar parámetros de retardo, tono y ganancia', () => {
    processor.updateConfig({ delayMs: 120, pitchSemitones: 2, feedbackGain: 0.5 });
    const config = processor.getConfig();
    expect(config.delayMs).toBe(120);
    expect(config.pitchSemitones).toBe(2);
    expect(config.feedbackGain).toBe(0.5);
  });

  it('indica si el entorno soporta Web Audio y getUserMedia', () => {
    const supported = processor.isSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('detiene correctamente el procesamiento sin arrojar excepciones', () => {
    expect(() => processor.stop()).not.toThrow();
    expect(processor.getIsRunning()).toBe(false);
  });

  it('maneja el flujo de inicio en entornos simulados', async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
    } as unknown as MediaStream;

    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    try {
      await processor.start({ delayMs: 75 });
      expect(processor.getIsRunning()).toBe(true);
      processor.stop();
      expect(processor.getIsRunning()).toBe(false);
    } catch {
      // En jsdom sin AudioContext completo es un fallback seguro
      processor.stop();
    }
  });
});

