import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioMetronome } from './audioMetronome';

describe('AudioMetronome Engine - Unit Tests', () => {
  let mockOscillator: {
    type: string;
    frequency: { value: number };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let mockGainNode: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
    connect: ReturnType<typeof vi.fn>;
  };
  let mockAudioContext: {
    state: string;
    currentTime: number;
    resume: ReturnType<typeof vi.fn>;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    destination: Record<string, unknown>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockOscillator = {
      type: 'sine',
      frequency: { value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'running',
      currentTime: 10.0,
      resume: vi.fn(),
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
    };

    // Inject constructible class into window
    class MockAudioContextClass {
      constructor() {
        return mockAudioContext;
      }
    }

    (window as unknown as { AudioContext: unknown }).AudioContext = MockAudioContextClass;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debe inicializarse con el BPM configurado y estado detenido', () => {
    const metronome = new AudioMetronome(90);
    const state = metronome.getState();

    expect(state.bpm).toBe(90);
    expect(state.isPlaying).toBe(false);
    expect(state.isMuted).toBe(false);
    expect(state.currentBeat).toBe(0);
  });

  it('debe ajustar el BPM limitándolo al rango válido (40 - 240)', () => {
    const metronome = new AudioMetronome(80);

    metronome.setBpm(120);
    expect(metronome.getState().bpm).toBe(120);

    metronome.setBpm(20); // Menor que 40
    expect(metronome.getState().bpm).toBe(40);

    metronome.setBpm(300); // Mayor que 240
    expect(metronome.getState().bpm).toBe(240);
  });

  it('debe alternar el estado de silencio (mute)', () => {
    const metronome = new AudioMetronome(80);

    expect(metronome.toggleMute()).toBe(true);
    expect(metronome.getState().isMuted).toBe(true);

    expect(metronome.toggleMute()).toBe(false);
    expect(metronome.getState().isMuted).toBe(false);
  });

  it('debe iniciar la reproducción y activar el programador', () => {
    const onTick = vi.fn();
    const metronome = new AudioMetronome(120, onTick);

    metronome.start();
    expect(metronome.getState().isPlaying).toBe(true);

    // Avanzar temporizador
    vi.advanceTimersByTime(100);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });

  it('debe detener la reproducción correctamente', () => {
    const metronome = new AudioMetronome(120);

    metronome.start();
    expect(metronome.getState().isPlaying).toBe(true);

    metronome.stop();
    expect(metronome.getState().isPlaying).toBe(false);
  });

  it('debe alternar start y stop mediante toggle()', () => {
    const metronome = new AudioMetronome(100);

    expect(metronome.toggle()).toBe(true);
    expect(metronome.getState().isPlaying).toBe(true);

    expect(metronome.toggle()).toBe(false);
    expect(metronome.getState().isPlaying).toBe(false);
  });
});
