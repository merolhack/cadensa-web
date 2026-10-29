import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PediatricFluencyTrainer } from './PediatricFluencyTrainer';

describe('PediatricFluencyTrainer Component', () => {
  it('debe renderizar el título de la aventura infantil y los avatares animales', () => {
    render(<PediatricFluencyTrainer />);

    expect(screen.getByText(/Aventura del Habla Suave/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tortuga Zen/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Cadensín el Castor/i)).toBeInTheDocument();
    expect(screen.getByText(/Colibrí Cantor/i)).toBeInTheDocument();
  });

  it('debe simular la práctica infantil y mostrar las estrellas ganadas', () => {
    render(<PediatricFluencyTrainer />);

    const playBtn = screen.getByRole('button', { name: /¡pronunciar como tortuga zen!/i });
    fireEvent.click(playBtn);

    expect(screen.getByText(/¡Hablaste suave y al ritmo perfecto!/i)).toBeInTheDocument();
    expect(screen.getByText(/estrellas para tu cofre mágico/i)).toBeInTheDocument();
  });

  it('debe cambiar de desafío al hacer clic en Siguiente Cuento', () => {
    render(<PediatricFluencyTrainer />);

    const nextBtn = screen.getByRole('button', { name: /siguiente cuento/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Juega a atrapar la pelota en el césped/i)).toBeInTheDocument();
  });
});
