import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Collapsible } from './Collapsible';

describe('Collapsible Component', () => {
  it('se renderiza colapsado por defecto y oculta su contenido', () => {
    render(
      <Collapsible title="Ajustes de audio" subtitle="Tempo y timbres">
        <p>Contenido de configuración</p>
      </Collapsible>
    );

    expect(screen.getByText('Ajustes de audio')).toBeInTheDocument();
    expect(screen.getByText('Tempo y timbres')).toBeInTheDocument();
    expect(screen.getByText('Contenido de configuración')).not.toBeVisible();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('se expande al hacer clic en el encabezado en modo no controlado', () => {
    render(
      <Collapsible title="Herramientas" icon="🛠️">
        <p>Módulo desplegado</p>
      </Collapsible>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Módulo desplegado')).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('respeta el modo controlado y dispara onToggle', () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <Collapsible
        title="Modo controlado"
        isOpen={false}
        onToggle={handleToggle}
      >
        <p>Contenido dinámico</p>
      </Collapsible>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleToggle).toHaveBeenCalledWith(true);

    rerender(
      <Collapsible
        title="Modo controlado"
        isOpen={true}
        onToggle={handleToggle}
      >
        <p>Contenido dinámico</p>
      </Collapsible>
    );

    expect(screen.getByText('Contenido dinámico')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
