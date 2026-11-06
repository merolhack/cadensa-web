import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Disclosure } from './Disclosure';

describe('Disclosure Component', () => {
  it('renderiza el summary con su ícono y badge', () => {
    render(
      <Disclosure
        summary="¿Por qué funciona este método?"
        icon="🧠"
        badge="Evidencia A"
      >
        <p>Explicación neurobiológica detallada.</p>
      </Disclosure>
    );

    expect(screen.getByText('¿Por qué funciona este método?')).toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('Evidencia A')).toBeInTheDocument();
    expect(screen.getByText('Explicación neurobiológica detallada.')).toBeInTheDocument();
  });

  it('respeta la propiedad defaultOpen', () => {
    const { container } = render(
      <Disclosure summary="Detalles" defaultOpen={true}>
        <p>Contenido visible</p>
      </Disclosure>
    );

    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
  });

  it('permite alternar el estado del details al interactuar', () => {
    const { container } = render(
      <Disclosure summary="Pregunta">
        <p>Respuesta expandida</p>
      </Disclosure>
    );

    const details = container.querySelector('details')!;
    const summary = container.querySelector('summary')!;
    expect(details.hasAttribute('open')).toBe(false);

    fireEvent.click(summary);
    expect(details.hasAttribute('open')).toBe(true);
  });
});

