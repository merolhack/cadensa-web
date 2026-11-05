import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MicrophoneConsentModal } from './MicrophoneConsentModal';

describe('MicrophoneConsentModal Component - Unit Tests', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    render(<MicrophoneConsentModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza la explicación y garantía de privacidad Zero Trust cuando isOpen es true', () => {
    render(<MicrophoneConsentModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Permiso de Micrófono/i)).toBeInTheDocument();
    expect(screen.getByText(/Garantía de Privacidad Absoluta/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Tu audio se procesa en tiempo real dentro de tu navegador y nunca se envía a internet/i)
    ).toBeInTheDocument();
  });

  it('llama a onConfirm al presionar el botón de activación', async () => {
    const handleConfirm = vi.fn();
    render(<MicrophoneConsentModal isOpen={true} onConfirm={handleConfirm} onCancel={vi.fn()} />);

    const confirmBtn = screen.getByRole('button', { name: /Entendido, activar micrófono/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al presionar el botón de cancelar', async () => {
    const handleCancel = vi.fn();
    render(<MicrophoneConsentModal isOpen={true} onConfirm={vi.fn()} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});

