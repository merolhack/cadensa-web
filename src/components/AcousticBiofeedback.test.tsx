import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AcousticBiofeedback } from './AcousticBiofeedback';

describe('AcousticBiofeedback Component', () => {
  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <AcousticBiofeedback isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título, nivel de tensión y recomendaciones cuando isOpen es true', () => {
    render(<AcousticBiofeedback isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Biofeedback Acústico On-Device/i)).toBeInTheDocument();
    expect(screen.getByText(/Nivel de Tensión Laringotraqueal/i)).toBeInTheDocument();
    expect(screen.getByText(/Guía de Desactivación Inmediata/i)).toBeInTheDocument();
  });

  it('debe actualizar el estado visual al simular un bloqueo tónico', () => {
    render(<AcousticBiofeedback isOpen={true} onClose={() => {}} />);

    const highBtn = screen.getByRole('button', { name: /Bloqueo Tónico/i });
    fireEvent.click(highBtn);

    expect(screen.getByText(/Hiperaducción • Bloqueo Inminente/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiperaducción laríngea alta/i)).toBeInTheDocument();
  });

  it('debe permitir aplicar la técnica de Inicio Suave desde el modal', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <AcousticBiofeedback
        isOpen={true}
        onClose={handleClose}
        onApplyTechnique={handleApply}
      />
    );

    // Provocar tensión
    const tenseBtn = screen.getByRole('button', { name: /Tensión Media/i });
    fireEvent.click(tenseBtn);

    const applyBtn = screen.getByRole('button', { name: /Activar Técnica de Inicio Suave/i });
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith('easy_onset');
    expect(handleClose).toHaveBeenCalled();
  });
});
