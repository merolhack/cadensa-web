import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CustomPhraseTrainer, PRESET_CHALLENGE_TEMPLATES } from './CustomPhraseTrainer';

describe('CustomPhraseTrainer', () => {
  const speakMock = vi.fn();
  const cancelMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock de SpeechSynthesisUtterance
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = 'es-ES';
      rate = 1;
      pitch = 1;
      constructor(text: string) {
        this.text = text;
      }
    }
    // @ts-expect-error Mocking global SpeechSynthesisUtterance
    globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    // Mock de window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: cancelMock,
        speaking: false,
        paused: false,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <CustomPhraseTrainer isOpen={false} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza título, plantillas, input y botón Silabizar cuando isOpen es true', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Mis Frases de Desafío/i)).toBeInTheDocument();
    expect(screen.getByText(/Pedir café/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Escribe tu propia frase personalizada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Silabizar/i })).toBeInTheDocument();
  });

  it('permite aplicar una plantilla rápida y silabear en tiempo real', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const tmplButton = screen.getByText(/Pedir café/i);
    act(() => {
      fireEvent.click(tmplButton);
    });

    const input = screen.getByLabelText(/Escribe tu propia frase personalizada/i) as HTMLInputElement;
    expect(input.value).toBe(PRESET_CHALLENGE_TEMPLATES[0].phrase);

    // Debe mostrar la sección de cajas visuales de sílabas
    expect(screen.getByText(/Cajas Visuales de Sílabas/i)).toBeInTheDocument();
    expect(screen.getByText('Un')).toBeInTheDocument();
    expect(screen.getByText('ca')).toBeInTheDocument();
  });

  it('permite escribir una frase y presionar el botón Silabizar', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const input = screen.getByLabelText(/Escribe tu propia frase personalizada/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'Quiero agua fresca' } });
    });

    const silabizeBtn = screen.getByRole('button', { name: /Silabizar/i });
    act(() => {
      fireEvent.click(silabizeBtn);
    });

    expect(screen.getByText(/Cajas Visuales de Sílabas/i)).toBeInTheDocument();
    expect(screen.getByText('Quie')).toBeInTheDocument();
    expect(screen.getByText('ro')).toBeInTheDocument();
  });

  it('reproduce sílabas con Web Speech API en sincronía con el metrónomo', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const input = screen.getByLabelText(/Escribe tu propia frase personalizada/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'Hola mundo' } });
    });

    const playBtn = screen.getByRole('button', { name: /Reproducir con Metrónomo TTS/i });
    act(() => {
      fireEvent.click(playBtn);
    });

    // Debe comenzar la reproducción de la primera sílaba inmediatamente
    expect(speakMock).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Detener/i })).toBeInTheDocument();

    // Avanzar el timer para la siguiente sílaba
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(speakMock).toHaveBeenCalledTimes(2);

    // Detener manualmente
    const stopBtn = screen.getByRole('button', { name: /Detener/i });
    act(() => {
      fireEvent.click(stopBtn);
    });
    expect(cancelMock).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Detener/i })).not.toBeInTheDocument();
  });

  it('guarda una frase en localStorage y la muestra en el repertorio', () => {
    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    const input = screen.getByLabelText(/Escribe tu propia frase personalizada/i);
    act(() => {
      fireEvent.change(input, { target: { value: 'Refrigerador de la cocina' } });
    });

    const saveButton = screen.getByRole('button', { name: /Guardar Frase/i });
    act(() => {
      fireEvent.click(saveButton);
    });

    expect(screen.getByText(/"Refrigerador de la cocina"/i)).toBeInTheDocument();
    expect(localStorage.getItem('cadensa_custom_phrases')).toContain('Refrigerador de la cocina');
  });

  it('permite seleccionar una frase guardada para entrenarla en la estación', () => {
    const onSelectPhraseMock = vi.fn();
    const onCloseMock = vi.fn();

    localStorage.setItem(
      'cadensa_custom_phrases',
      JSON.stringify([
        {
          id: 'test-1',
          phrase: 'Quiero un vaso de agua',
          bpm: 65,
          createdAt: new Date().toISOString(),
          syllables: ['Quie', 'ro', 'un', 'va', 'so'],
        },
      ])
    );

    render(
      <CustomPhraseTrainer
        isOpen={true}
        onClose={onCloseMock}
        onSelectPhrase={onSelectPhraseMock}
      />
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const trainButton = screen.getByTitle('Entrenar esta frase en la estación');
    act(() => {
      fireEvent.click(trainButton);
    });

    expect(onSelectPhraseMock).toHaveBeenCalledWith('Quiero un vaso de agua', 65);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('permite eliminar una frase del repertorio personal', () => {
    localStorage.setItem(
      'cadensa_custom_phrases',
      JSON.stringify([
        {
          id: 'to-delete',
          phrase: 'Frase que ya no necesito',
          bpm: 70,
          createdAt: new Date().toISOString(),
          syllables: ['Fra', 'se'],
        },
      ])
    );

    render(
      <CustomPhraseTrainer isOpen={true} onClose={vi.fn()} onSelectPhrase={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText(/"Frase que ya no necesito"/i)).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('Eliminar de mi lista');
    act(() => {
      fireEvent.click(deleteBtn);
    });

    expect(screen.queryByText(/"Frase que ya no necesito"/i)).not.toBeInTheDocument();
  });
});
