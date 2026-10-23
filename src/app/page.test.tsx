import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('debe incluir la mención al habla rítmica silábica', () => {
    render(<Home />);
    expect(
      screen.getByText(/basada en el habla rítmica silábica/i)
    ).toBeInTheDocument();
  });

  it('debe mostrar la insignia de Prueba de Concepto', () => {
    render(<Home />);
    expect(
      screen.getByText(/prueba de concepto - infraestructura base/i)
    ).toBeInTheDocument();
  });
});
