import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaqAndMethodology } from './FaqAndMethodology';

describe('FaqAndMethodology Component - Unit Tests', () => {
  it('debe renderizar el título de la sección FAQ y la sección de Habla Rítmica Silábica (STS)', () => {
    render(<FaqAndMethodology />);

    expect(
      screen.getByRole('heading', { level: 2, name: /preguntas frecuentes y guía de botones/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /¿qué es el habla rítmica silábica \(sts\)\?/i })
    ).toBeInTheDocument();
  });

  it('debe explicar el funcionamiento del botón Registrar Sílaba y Fading', () => {
    render(<FaqAndMethodology />);

    // Buscar y abrir la pregunta sobre Registrar Sílaba
    const syncQuestion = screen.getByText(/¿qué hace el botón "🎙️ registrar sílaba" y cómo mide la precisión\?/i);
    fireEvent.click(syncQuestion);

    expect(screen.getByText(/¡a compás perfecto!/i)).toBeInTheDocument();
    expect(screen.getByText(/micro-vibración háptica/i)).toBeInTheDocument();

    // Buscar y abrir la pregunta de Reto Activo / Fading
    const fadingQuestion = screen.getByText(/¿qué significa el botón "🎯 reto activo \/ fading"\?/i);
    fireEvent.click(fadingQuestion);

    expect(screen.getByText(/4 compases sonoros seguidos de 2 compases en absoluto silencio/i)).toBeInTheDocument();
  });

  it('debe explicar las bases neurobiológicas de STS en los ganglios basales', () => {
    render(<FaqAndMethodology />);

    expect(screen.getByText(/ganglios basales/i)).toBeInTheDocument();
    expect(screen.getByText(/marcapasos neural alternativo/i)).toBeInTheDocument();
    expect(screen.getByText(/alivio de la ansiedad anticipatoria/i)).toBeInTheDocument();
  });
});
