import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('debe renderizar los enlaces a las 7 técnicas fonoaudiológicas clínicas', () => {
    render(<Footer />);

    const techniques = [
      '/tecnicas/sts',
      '/tecnicas/easy_onset',
      '/tecnicas/light_contact',
      '/tecnicas/prolonged_speech',
      '/tecnicas/box_breathing',
      '/tecnicas/pull_out',
      '/tecnicas/cancellation',
    ];

    const allLinks = screen.getAllByRole('link');
    techniques.forEach((href) => {
      const link = allLinks.find((el) => el.getAttribute('href') === href);
      expect(link).toBeDefined();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('debe renderizar los enlaces institucionales, legales y autor', () => {
    render(<Footer />);

    const platformUrls = ['/about', '/stats', '/privacy', '/terms', '/admin', 'https://merolhack.github.io'];
    const allLinks = screen.getAllByRole('link');

    platformUrls.forEach((href) => {
      const link = allLinks.find((el) => el.getAttribute('href') === href);
      expect(link).toBeDefined();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('debe renderizar el aviso fonoaudiológico YMYL y el enlace comunitario AMTTM', () => {
    render(<Footer />);

    expect(screen.getByText(/Aviso Fonoaudiológico YMYL/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Asociación Mexicana de la Tartamudez/i).length).toBeGreaterThanOrEqual(1);
  });

  it('debe renderizar nota de contexto opcional y botón de comentarios si se proporcionan', () => {
    const handleFeedback = vi.fn();
    render(
      <Footer
        contextNotice="Métricas de prueba"
        onOpenFeedback={handleFeedback}
      />
    );

    expect(screen.getByText('Métricas de prueba')).toBeInTheDocument();

    const feedbackBtn = screen.getByRole('button', { name: /enviar comentarios/i });
    expect(feedbackBtn).toBeInTheDocument();
    fireEvent.click(feedbackBtn);
    expect(handleFeedback).toHaveBeenCalledTimes(1);
  });
});
