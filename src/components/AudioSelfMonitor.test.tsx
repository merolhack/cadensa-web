import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioSelfMonitor } from './AudioSelfMonitor';

describe('AudioSelfMonitor', () => {
  let activeRecorderInstance: MockMediaRecorder | null = null;

  class MockMediaRecorder {
    start = vi.fn();
    stop = vi.fn(() => {
      if (this.ondataavailable) {
        this.ondataavailable({ data: new Blob(['mock-audio'], { type: 'audio/webm' }) });
      }
      if (this.onstop) {
        this.onstop();
      }
    });
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;

    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      activeRecorderInstance = this;
    }
  }

  beforeEach(() => {
    vi.useFakeTimers();
    activeRecorderInstance = null;

    // Mock URL createObjectURL y revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:cadensa-mock-audio');
    global.URL.revokeObjectURL = vi.fn();

    // @ts-expect-error Mocking MediaRecorder class
    global.MediaRecorder = MockMediaRecorder;

    // Mock getUserMedia
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
      writable: true,
      configurable: true,
    });

    // Mock Audio constructor
    // @ts-expect-error Mocking Audio constructor
    global.Audio = class {
      play = vi.fn().mockResolvedValue(undefined);
      pause = vi.fn();
      src = '';
      onended: (() => void) | null = null;
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renderiza la sección de auto-escucha y aviso de privacidad Zero Trust', () => {
    render(<AudioSelfMonitor />);

    expect(screen.getByText(/Auto-Escucha Fonoaudiológica/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacidad Zero Trust/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grabar Práctica/i })).toBeInTheDocument();
  });

  it('inicia la grabación correctamente y cambia al botón de detener con cronómetro', async () => {
    render(<AudioSelfMonitor />);

    const recordBtn = screen.getByRole('button', { name: /Grabar Práctica/i });
    await act(async () => {
      fireEvent.click(recordBtn);
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(activeRecorderInstance?.start).toHaveBeenCalled();

    // Avanzar 3 segundos en el temporizador
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/Detener \(00:03\)/i)).toBeInTheDocument();
  });

  it('detiene la grabación y muestra los controles de reproducción y descarte', async () => {
    render(<AudioSelfMonitor />);

    // Iniciar grabación
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grabar Práctica/i }));
    });

    // Detener grabación
    const stopBtn = screen.getByRole('button', { name: /Detener/i });
    await act(async () => {
      fireEvent.click(stopBtn);
    });

    expect(activeRecorderInstance?.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Escucharme/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Descartar grabación/i)).toBeInTheDocument();

    // Probar descarte
    const discardBtn = screen.getByTitle(/Descartar grabación/i);
    await act(async () => {
      fireEvent.click(discardBtn);
    });

    expect(screen.queryByRole('button', { name: /Escucharme/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grabar Práctica/i })).toBeInTheDocument();
  });

  it('muestra mensaje de error si no se autoriza el micrófono', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
      new Error('Permission denied')
    );

    render(<AudioSelfMonitor />);

    const recordBtn = screen.getByRole('button', { name: /Grabar Práctica/i });
    await act(async () => {
      fireEvent.click(recordBtn);
    });

    expect(
      screen.getByText(/No se pudo acceder al micrófono/i)
    ).toBeInTheDocument();
  });
});
