import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PediatricFluencyTrainer } from './PediatricFluencyTrainer';

describe('PediatricFluencyTrainer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar el título de la aventura infantil y los avatares animales', () => {
    render(<PediatricFluencyTrainer />);

    expect(screen.getByText(/Aventura del Habla Suave/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tortuga Zen/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cadensín el Castor/i)).toBeInTheDocument();
    expect(screen.getByText(/Colibrí Cantor/i)).toBeInTheDocument();
  });

  it('debe iniciar la práctica interactiva animando las sílabas y entregando estrellas al finalizar', () => {
    render(<PediatricFluencyTrainer />);

    const playBtn = screen.getByRole('button', { name: /¡pronunciar como tortuga zen!/i });
    
    // Iniciar práctica
    act(() => {
      fireEvent.click(playBtn);
    });

    // Se transforma en botón de pausa
    expect(screen.getByRole('button', { name: /pausar aventura/i })).toBeInTheDocument();

    // Avanzar el tiempo para todas las sílabas (10 sílabas a 1000ms cada una = 10000ms)
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    // Debe mostrar la recompensa triunfal
    expect(screen.getByText(/¡Hablaste suave y al ritmo perfecto!/i)).toBeInTheDocument();
    expect(screen.getByText(/estrellas para tu cofre mágico/i)).toBeInTheDocument();
  });

  it('debe cambiar de desafío al hacer clic en Siguiente Cuento y Anterior Cuento', () => {
    render(<PediatricFluencyTrainer />);

    expect(screen.getByText(/Ayuda al oso a buscar su merienda/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /siguiente cuento/i });
    act(() => {
      fireEvent.click(nextBtn);
    });

    expect(screen.getByText(/Juega a atrapar la pelota en el césped/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /anterior/i });
    act(() => {
      fireEvent.click(prevBtn);
    });

    expect(screen.getByText(/Ayuda al oso a buscar su merienda/i)).toBeInTheDocument();
  });

  it('permite cambiar de avatar y actualiza el consejo y tempo', () => {
    render(<PediatricFluencyTrainer />);

    const beaverBtn = screen.getByRole('button', { name: /cadensín el castor/i });
    act(() => {
      fireEvent.click(beaverBtn);
    });

    expect(screen.getByText(/Construyamos el ritmo con cada sílaba/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /¡pronunciar como cadensín el castor!/i })).toBeInTheDocument();
  });

  it('permite activar el Modo Dúo y disparar aplauso motivador sumando estrellas', () => {
    render(<PediatricFluencyTrainer />);

    const duoToggle = screen.getByRole('button', { name: /modo dúo/i });
    act(() => {
      fireEvent.click(duoToggle);
    });

    const applauseBtn = screen.getByRole('button', { name: /¡aplauso motivador!/i });
    expect(applauseBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(applauseBtn);
    });

    expect(screen.getByText(/¡Bravo! \+1 Estrella/i)).toBeInTheDocument();
  });
});
