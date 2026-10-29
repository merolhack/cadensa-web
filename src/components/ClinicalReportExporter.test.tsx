import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClinicalReportExporter } from './ClinicalReportExporter';

describe('ClinicalReportExporter Component', () => {
  it('debe renderizar el botón disparador de exportación', () => {
    render(<ClinicalReportExporter />);
    const button = screen.getByRole('button', { name: /exportar informe clínico/i });
    expect(button).toBeInTheDocument();
  });

  it('debe abrir el modal de exportación fonoaudiológico al hacer clic', () => {
    render(<ClinicalReportExporter />);
    const button = screen.getByRole('button', { name: /exportar informe clínico/i });
    fireEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Informe Clínico Fonoaudiológico')).toBeInTheDocument();
    expect(screen.getByLabelText(/identificador del paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/jitter vocal/i)).toBeInTheDocument();
  });

  it('debe permitir seleccionar formatos y cerrar el modal', () => {
    render(<ClinicalReportExporter />);
    fireEvent.click(screen.getByRole('button', { name: /exportar informe clínico/i }));

    const txtButton = screen.getByRole('button', { name: /texto plano/i });
    fireEvent.click(txtButton);

    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

