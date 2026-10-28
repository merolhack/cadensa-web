import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TechniqueFeedbackButton } from './TechniqueFeedbackButton';

vi.mock('@/lib/feedbackService', () => ({
  submitFeedbackReport: vi.fn(),
  checkFeedbackRateLimit: vi.fn(() => ({ allowed: true, remainingSubmissions: 3 })),
  clearFeedbackRateLimit: vi.fn(),
  recordFeedbackSubmission: vi.fn(),
}));

describe('TechniqueFeedbackButton', () => {
  it('renderiza el botón y abre el modal al hacer clic', () => {
    render(
      <TechniqueFeedbackButton techniqueId="sts" techniqueName="STS" />
    );

    const button = screen.getByRole('button', {
      name: /reportar un error o sugerencia sobre la técnica sts/i,
    });
    expect(button).toBeInTheDocument();

    // El modal no debe estar visible inicialmente
    expect(screen.queryByRole('dialog')).toBeNull();

    // Al hacer clic, se abre el modal
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

