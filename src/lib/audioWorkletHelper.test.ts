import { describe, it, expect, vi } from 'vitest';
import {
  calculateVoiceJitter,
  setupUltraLowLatencyVoiceDetector,
  AUDIO_WORKLET_CODE,
} from './audioWorkletHelper';

describe('audioWorkletHelper', () => {
  it('debe contener la definición del código fuente del procesador AudioWorklet', () => {
    expect(AUDIO_WORKLET_CODE).toContain('class CadensaVADProcessor');
    expect(AUDIO_WORKLET_CODE).toContain('registerProcessor');
    expect(AUDIO_WORKLET_CODE).toContain('cadensa-vad-processor');
  });

  it('debe calcular el jitter vocal fonoaudiológico con regularidad esperada', () => {
    // Caso 1: Intervalos regulares exactos de 750ms (80 BPM)
    const exactOnsets = [1000, 1750, 2500, 3250];
    const resExact = calculateVoiceJitter(exactOnsets, 750);
    expect(resExact.jitterMs).toBe(0);
    expect(resExact.isRegular).toBe(true);

    // Caso 2: Intervalos con ligero desfase (±30ms) -> regular
    const smallDevOnsets = [1000, 1770, 2510, 3290];
    const resSmall = calculateVoiceJitter(smallDevOnsets, 750);
    expect(resSmall.jitterMs).toBeLessThanOrEqual(45);
    expect(resSmall.isRegular).toBe(true);

    // Caso 3: Desfase pronunciado (>45ms) -> no regular
    const largeDevOnsets = [1000, 1850, 2400, 3400];
    const resLarge = calculateVoiceJitter(largeDevOnsets, 750);
    expect(resLarge.jitterMs).toBeGreaterThan(45);
    expect(resLarge.isRegular).toBe(false);
  });

  it('debe retornar 0 jitter si hay menos de 2 marcas de tiempo', () => {
    expect(calculateVoiceJitter([1000], 750)).toEqual({ jitterMs: 0, isRegular: true });
    expect(calculateVoiceJitter([], 750)).toEqual({ jitterMs: 0, isRegular: true });
  });

  it('debe inicializar el detector con fallback a AnalyserNode en entornos simulados', async () => {
    const mockAudioContext = {
      createMediaStreamSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 256,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getFloatTimeDomainData: vi.fn((buf: Float32Array) => {
          buf.fill(0.05); // Supera el umbral VAD
        }),
      }),
      close: vi.fn().mockResolvedValue(undefined),
      state: 'running',
    };

    function MockAudioCtx() {
      return mockAudioContext;
    }

    vi.stubGlobal('AudioContext', MockAudioCtx);

    const mockStream = {} as MediaStream;
    const onOnset = vi.fn();
    const onVolume = vi.fn();

    const detector = await setupUltraLowLatencyVoiceDetector(mockStream, {
      vadThreshold: 0.02,
      onVoiceOnset: onOnset,
      onVolumeUpdate: onVolume,
    });

    expect(detector).toBeDefined();
    expect(typeof detector.stop).toBe('function');

    // Esperar a que el intervalo del fallback ejecute un tick
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onVolume).toHaveBeenCalled();
    expect(onOnset).toHaveBeenCalled();

    detector.stop();
    expect(mockAudioContext.close).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
