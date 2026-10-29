import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserCompatibilityBanner } from './BrowserCompatibilityBanner';

describe('BrowserCompatibilityBanner Component', () => {
  it('debe renderizar el aviso discreto de compatibilidad en el pie de página', () => {
    render(<BrowserCompatibilityBanner />);

    expect(screen.getAllByText(/Navegador/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /ver matriz técnica de navegadores/i })).toBeInTheDocument();
  });

  it('debe abrir y cerrar el modal con la matriz de soporte cross-browser', () => {
    render(<BrowserCompatibilityBanner />);

    const openBtn = screen.getByRole('button', { name: /ver matriz técnica de navegadores/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Matriz de Compatibilidad Multi-Navegador/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Chrome • Microsoft Edge • Opera/i)).toBeInTheDocument();
    expect(screen.getByText(/Apple Safari/i)).toBeInTheDocument();
    expect(screen.getByText(/Mozilla Firefox/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /entendido, continuar practicando/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Matriz de Compatibilidad Multi-Navegador/i)).not.toBeInTheDocument();
  });
});
