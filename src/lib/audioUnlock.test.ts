import { describe, it, expect, vi } from 'vitest';
import { setupAudioContextUnlock } from './audioUnlock';

describe('audioUnlock helper', () => {
  it('registra eventos y ejecuta resume sobre el AudioContext al interactuar', async () => {
    const resumeMock = vi.fn().mockResolvedValue(undefined);
    const mockCtx = {
      state: 'suspended',
      resume: resumeMock,
    } as unknown as AudioContext;

    const cleanup = setupAudioContextUnlock(() => mockCtx);

    // Disparar evento pointerdown
    window.dispatchEvent(new Event('pointerdown'));

    expect(resumeMock).toHaveBeenCalled();
    cleanup();
  });

  it('no falla si el AudioContext retorna null', () => {
    const cleanup = setupAudioContextUnlock(() => null);
    expect(() => {
      window.dispatchEvent(new Event('touchstart'));
    }).not.toThrow();
    cleanup();
  });
});

