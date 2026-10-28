import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackModal } from './FeedbackModal';
import * as feedbackService from '@/lib/feedbackService';

vi.mock('@/lib/feedbackService', () => ({
  submitFeedbackReport: vi.fn(),
  checkFeedbackRateLimit: vi.fn(() => ({ allowed: true, remainingSubmissions: 3 })),
  clearFeedbackRateLimit: vi.fn(),
  recordFeedbackSubmission: vi.fn(),
}));

describe('FeedbackModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <FeedbackModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el modal con sus campos y categorías cuando isOpen es true', () => {
    render(
      <FeedbackModal isOpen={true} onClose={vi.fn()} defaultTechniqueId="sts" />
    );

    expect(
      screen.getByRole('dialog', { name: /enviar comentarios o reportar error/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /falla en video o audio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /duda o técnica/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sugerencia/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción del reporte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar reporte/i })).toBeDisabled();
  });

  it('habilita el botón de envío y procesa el reporte exitosamente', async () => {
    vi.mocked(feedbackService.submitFeedbackReport).mockResolvedValueOnce({
      success: true,
      message: '¡Gracias! Tu reporte ha sido recibido.',
    });

    render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
        defaultCategory="video_issue"
        defaultTechniqueId="sts"
      />
    );

    const textarea = screen.getByLabelText(/descripción del reporte/i);
    fireEvent.change(textarea, {
      target: { value: 'El video de ritmo silábico no reproduce audio en el móvil.' },
    });

    const emailInput = screen.getByLabelText(/correo de contacto/i);
    fireEvent.change(emailInput, {
      target: { value: 'usuario@cadensa.org' },
    });

    const submitBtn = screen.getByRole('button', { name: /enviar reporte/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(feedbackService.submitFeedbackReport).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'video_issue',
          techniqueId: 'sts',
          message: 'El video de ritmo silábico no reproduce audio en el móvil.',
          contactEmail: 'usuario@cadensa.org',
        })
      );
    });

    expect(
      await screen.findByText(/¡Gracias por ayudarnos a mejorar Cadensa!/i)
    ).toBeInTheDocument();
  });

  it('cierra el modal al pulsar la tecla Escape o el botón de cerrar', () => {
    const handleClose = vi.fn();
    render(<FeedbackModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByLabelText(/cerrar modal de comentarios/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
