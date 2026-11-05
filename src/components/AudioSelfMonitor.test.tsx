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

    localStorage.setItem('cadensa_mic_consent', 'granted');
  });

  afterEach(() => {
    localStorage.clear();
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

  it('notifica onRecordingStart y onRecordingStop al iniciar y detener la grabación para sincronizar el metrónomo', async () => {
    const onStart = vi.fn();
    const onStop = vi.fn();

    render(<AudioSelfMonitor onRecordingStart={onStart} onRecordingStop={onStop} isPlaying={true} />);

    // Iniciar grabación
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grabar Práctica/i }));
    });
    expect(onStart).toHaveBeenCalledTimes(1);

    // Detener grabación
    const stopBtn = screen.getByRole('button', { name: /Detener/i });
    await act(async () => {
      fireEvent.click(stopBtn);
    });
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('notifica onPlaybackStart al escuchar la grabación para evitar interferencia acústica', async () => {
    const onPlayback = vi.fn();

    render(<AudioSelfMonitor onPlaybackStart={onPlayback} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grabar Práctica/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Detener/i }));
    });

    const listenBtn = screen.getByRole('button', { name: /Escucharme/i });
    await act(async () => {
      fireEvent.click(listenBtn);
    });

    expect(onPlayback).toHaveBeenCalledTimes(1);
  });

  it('detiene la grabación automáticamente si la práctica se detiene externamente', async () => {
    const onStop = vi.fn();
    const { rerender } = render(<AudioSelfMonitor isPlaying={true} onRecordingStop={onStop} />);

    // Iniciar grabación
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grabar Práctica/i }));
    });
    expect(activeRecorderInstance?.start).toHaveBeenCalled();

    // La práctica se detiene externamente (isPlaying cambia de true a false)
    await act(async () => {
      rerender(<AudioSelfMonitor isPlaying={false} onRecordingStop={onStop} />);
    });

    expect(activeRecorderInstance?.stop).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Escucharme/i })).toBeInTheDocument();
  });

  it('solicita consentimiento de micrófono la primera vez antes de acceder al hardware', async () => {
    localStorage.removeItem('cadensa_mic_consent');
    render(<AudioSelfMonitor />);

    // Al hacer clic sin consentimiento, debe abrirse el modal informativo
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Grabar Práctica/i }));
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Permiso de Micrófono/i)).toBeInTheDocument();

    // Confirmar consentimiento
    const confirmBtn = screen.getByRole('button', { name: /Entendido, activar micrófono/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(localStorage.getItem('cadensa_mic_consent')).toBe('granted');
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
