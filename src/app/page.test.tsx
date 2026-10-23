import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './page';

describe('Home Page - Unit Tests', () => {
  it('debe renderizar el título de la marca Cadensa', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1, name: /cadensa/i });
    expect(heading).toBeInTheDocument();
  });

  it('debe mostrar el lema principal de la plataforma', () => {
    render(<Home />);
    expect(screen.getByText(/encuentra el ritmo de tu voz/i)).toBeInTheDocument();
  });

  it('debe renderizar los botones de acción principal inmediatamente visibles', () => {
    render(<Home />);
    const playButton = screen.getByRole('button', { name: /comenzar práctica rítmica/i });
    expect(playButton).toBeInTheDocument();

    const audioButton = screen.getByRole('button', { name: /audio/i });
    expect(audioButton).toBeInTheDocument();
  });

  it('debe cambiar de frase y tempo al alternar entre Todas y Diadococinesia', () => {
    render(<Home />);
    
    // Inicialmente en "Todas", el primer ejercicio es Fonética Básica
    expect(screen.getByText(/estabilización métrica silábica/i)).toBeInTheDocument();

    // Al pulsar "Diadococinesia", cambia visiblemente el objetivo clínico y los fonemas
    const ddkButton = screen.getByRole('button', { name: /diadococinesia/i });
    fireEvent.click(ddkButton);

    expect(screen.getByText(/coordinación motriz velo-lingual/i)).toBeInTheDocument();
  });
});
