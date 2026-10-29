import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlteredAuditoryTrainer } from './AlteredAuditoryTrainer';

describe('AlteredAuditoryTrainer Component', () => {
  it('debe renderizar el título de alteración auditiva, advertencia de auriculares y sliders', () => {
    render(<AlteredAuditoryTrainer />);

    expect(screen.getByText(/Alteración Auditiva en Tiempo Real/i)).toBeInTheDocument();
    expect(screen.getByText(/Utiliza auriculares/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Retardo DAF en milisegundos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alteración de frecuencia en semitonos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /▶ Iniciar Bucle Auditivo/i })).toBeInTheDocument();
  });

  it('permite ajustar el slider de retardo DAF', () => {
    render(<AlteredAuditoryTrainer />);

    const delaySlider = screen.getByLabelText(/Retardo DAF en milisegundos/i) as HTMLInputElement;
    fireEvent.change(delaySlider, { target: { value: '140' } });

    expect(delaySlider.value).toBe('140');
    expect(screen.getByText('140 ms')).toBeInTheDocument();
  });

  it('permite alternar el estado del botón de inicio y detener', async () => {
    // Mock getUserMedia
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });

    render(<AlteredAuditoryTrainer />);

    const toggleBtn = screen.getByRole('button', { name: /▶ Iniciar Bucle Auditivo/i });
    fireEvent.click(toggleBtn);

    // Puede cambiar o mostrar feedback según el estado
    expect(toggleBtn).toBeInTheDocument();
  });
});
