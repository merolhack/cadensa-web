import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiadochokinesisTrainer } from './DiadochokinesisTrainer';

describe('DiadochokinesisTrainer Component', () => {
  it('debe renderizar la cabecera, selector de secuencias y botón de inicio', () => {
    render(<DiadochokinesisTrainer />);
    expect(screen.getByText(/evaluación y entrenamiento de diadococinesia oral/i)).toBeInTheDocument();
    expect(screen.getByText(/iniciar prueba de 10 segundos/i)).toBeInTheDocument();
    expect(screen.getByText('/pa-ta-ka/')).toBeInTheDocument();
  });

  it('debe cambiar la secuencia fonética seleccionada al hacer clic en otra opción', () => {
    render(<DiadochokinesisTrainer />);
    const badaGaBtn = screen.getByText('/ba-da-ga/');
    fireEvent.click(badaGaBtn);

    expect(screen.getByText('ba')).toBeInTheDocument();
    expect(screen.getByText('da')).toBeInTheDocument();
    expect(screen.getByText('ga')).toBeInTheDocument();
  });

  it('debe iniciar la prueba y permitir registrar pulsos silábicos', () => {
    vi.useFakeTimers();
    render(<DiadochokinesisTrainer />);

    const startBtn = screen.getByText(/iniciar prueba de 10 segundos/i);
    fireEvent.click(startBtn);

    // Botón interactivo activo
    const tapBtn = screen.getByText(/¡pulsa al pronunciar!/i);
    expect(tapBtn).toBeInTheDocument();

    // Registrar 3 sílabas
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);
    fireEvent.click(tapBtn);

    expect(screen.getByText('3')).toBeInTheDocument();

    // Avanzar el temporizador 10 segundos para finalizar la prueba
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Se deben mostrar los resultados de la prueba
    expect(screen.getByText(/resultados fonoaudiológicos/i)).toBeInTheDocument();
    expect(screen.getByText(/tasa articulatoria/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
