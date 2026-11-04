import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Componente que detona un error intencional para la prueba
const ProblematicChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Fallo de prueba forzado');
  }
  return <div>Estación de Práctica Operativa</div>;
};

describe('ErrorBoundary Component', () => {
  it('renderiza a los hijos normalmente cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Estación de Práctica Operativa')).toBeInTheDocument();
  });

  it('captura el error y renderiza la pantalla de recuperación accesible', () => {
    // Silenciamos console.error para que el output del test quede limpio
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Pausa Técnica Inesperada')).toBeInTheDocument();
    expect(screen.getByText(/Fallo de prueba forzado/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reiniciar sesión/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renderiza un fallback personalizado si es proporcionado', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Fallback Personalizado</div>}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback Personalizado')).toBeInTheDocument();

    spy.mockRestore();
  });
});
