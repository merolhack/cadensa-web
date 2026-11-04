import React from 'react';
import { describe, it, expect } from 'vitest';
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

    const txtButton = screen.getByRole('button', { name: /texto/i });
    fireEvent.click(txtButton);

    const fhirButton = screen.getByRole('button', { name: /fhir/i });
    fireEvent.click(fhirButton);
    expect(fhirButton.className).toContain('ring-purple-500');

    const csvButton = screen.getByRole('button', { name: /📊\s*csv/i });
    fireEvent.click(csvButton);
    expect(csvButton.className).toContain('border-teal-500');

    const closeBtn = screen.getByLabelText('Cerrar modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe admitir un botón personalizado como "Descargar Reporte para mi Fonoaudiólogo"', () => {
    render(<ClinicalReportExporter buttonLabel="Descargar Reporte para mi Fonoaudiólogo" />);
    const customButton = screen.getByRole('button', { name: /descargar reporte para mi fonoaudiólogo/i });
    expect(customButton).toBeInTheDocument();
  });
});

