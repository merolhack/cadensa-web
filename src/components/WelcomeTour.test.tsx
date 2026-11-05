import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WelcomeTour } from './WelcomeTour';

describe('WelcomeTour Component - Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('se abre automáticamente si es la primera vez que el usuario entra (cadensa_ftue_completed no existe)', () => {
    render(<WelcomeTour />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenida a Cadensa • Paso 1 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Encuentra el Ritmo de tu Voz/i)).toBeInTheDocument();
  });

  it('no se renderiza si ya se completó el onboarding previamente', () => {
    localStorage.setItem('cadensa_ftue_completed', 'true');
    render(<WelcomeTour />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se renderiza forzadamente si forceOpen es true aunque ya esté marcado en localStorage', () => {
    localStorage.setItem('cadensa_ftue_completed', 'true');
    render(<WelcomeTour forceOpen={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenida a Cadensa • Paso 1 de 4/i)).toBeInTheDocument();
  });

  it('permite avanzar paso a paso por los 4 pasos y muestra las instrucciones PWA y de privacidad', async () => {
    render(<WelcomeTour />);

    // Paso 1 -> Paso 2
    const nextBtn = screen.getByRole('button', { name: /Siguiente →/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    expect(screen.getByText(/Paso 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu Metrónomo y el Avatar IA 1080p/i)).toBeInTheDocument();

    // Paso 2 -> Paso 3
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Siguiente →/i }));
    });

    expect(screen.getByText(/Paso 3 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Instala Cadensa en tu Celular \(PWA\)/i)).toBeInTheDocument();

    // Paso 3 -> Paso 4
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Siguiente →/i }));
    });

    expect(screen.getByText(/Paso 4 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Tus Datos son 100% Tuyos/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Tus datos de voz y tus resultados de práctica nunca salen de tu dispositivo/i)
    ).toBeInTheDocument();

    // Paso 4: Finalizar tour
    const finishBtn = screen.getByRole('button', { name: /¡Comenzar mi práctica!/i });
    await act(async () => {
      fireEvent.click(finishBtn);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('cadensa_ftue_completed')).toBe('true');
  });

  it('permite saltar el tour en cualquier momento y guarda la flag en localStorage', async () => {
    render(<WelcomeTour />);

    const skipBtn = screen.getByRole('button', { name: /saltar tour/i });
    await act(async () => {
      fireEvent.click(skipBtn);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('cadensa_ftue_completed')).toBe('true');
  });

  it('se cierra con la tecla Escape', async () => {
    render(<WelcomeTour />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('cadensa_ftue_completed')).toBe('true');
  });
});
