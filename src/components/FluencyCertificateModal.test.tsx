import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FluencyCertificateModal } from './FluencyCertificateModal';
import * as fluencyCertModule from '@/lib/fluencyCertificate';

describe('FluencyCertificateModal', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <FluencyCertificateModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza correctamente cuando isOpen es true', () => {
    render(<FluencyCertificateModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Diplomas de Mérito y Fluidez')).toBeInTheDocument();
    expect(screen.getAllByText('Iniciador Valiente').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Guardián del Ritmo')).toBeInTheDocument();
    expect(screen.getByText('Maestro de la Calma')).toBeInTheDocument();
  });

  it('permite cambiar el nombre del paciente y actualiza la previsualización', () => {
    render(<FluencyCertificateModal isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByLabelText(/nombre del paciente o practicante/i);
    fireEvent.change(input, { target: { value: 'Mateo González' } });

    expect(screen.getByText('Mateo González')).toBeInTheDocument();
  });

  it('permite cambiar de certificado seleccionado', () => {
    render(<FluencyCertificateModal isOpen={true} onClose={vi.fn()} />);

    const cert2Button = screen.getByRole('button', { name: /Guardián del Ritmo/i });
    fireEvent.click(cert2Button);

    const headings = screen.getAllByRole('heading', { name: 'Guardián del Ritmo' });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('invoca openPrintableCertificate al hacer clic en Imprimir', () => {
    const openPrintSpy = vi
      .spyOn(fluencyCertModule, 'openPrintableCertificate')
      .mockImplementation(() => {});

    render(
      <FluencyCertificateModal
        isOpen={true}
        onClose={vi.fn()}
        defaultPatientName="Lucía Pérez"
      />
    );

    const printButton = screen.getByRole('button', { name: /imprimir \/ descargar pdf/i });
    fireEvent.click(printButton);

    expect(openPrintSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cert_001' }),
      'Lucía Pérez'
    );
    expect(
      screen.getByText(/ventana de impresión preparada/i)
    ).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en el botón de cerrar', () => {
    const onCloseMock = vi.fn();
    render(<FluencyCertificateModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar modal de certificados/i });
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
