import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormantBiofeedbackVisualizer } from './FormantBiofeedbackVisualizer';

describe('FormantBiofeedbackVisualizer Component', () => {
  it('debe renderizar el título del mapa del espacio vocálico y los formantes iniciales', () => {
    render(<FormantBiofeedbackVisualizer initialF1={800} initialF2={1350} />);

    expect(screen.getByText(/Mapa del Espacio Vocálico/i)).toBeInTheDocument();
    expect(screen.getByText(/Vocal: \/a\//i)).toBeInTheDocument();
    expect(screen.getByText(/800 Hz/i)).toBeInTheDocument();
    expect(screen.getByText(/1350 Hz/i)).toBeInTheDocument();
  });

  it('debe cambiar al preset de vocal al hacer clic en /i/', () => {
    render(<FormantBiofeedbackVisualizer initialF1={800} initialF2={1350} />);

    const btnI = screen.getByRole('button', { name: '/i/' });
    fireEvent.click(btnI);

    expect(screen.getByText(/Vocal: \/i\//i)).toBeInTheDocument();
    expect(screen.getByText(/280 Hz/i)).toBeInTheDocument();
    expect(screen.getByText(/2250 Hz/i)).toBeInTheDocument();
    expect(screen.getByText(/Cerrada • Anterior/i)).toBeInTheDocument();
  });
});
