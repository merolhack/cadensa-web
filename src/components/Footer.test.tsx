import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

  it('debe renderizar los enlaces institucionales y legales', () => {
    render(<Footer />);

    const platformUrls = ['/about', '/stats', '/privacy', '/terms'];
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
    expect(screen.getByText(/Asociación Mexicana de la Tartamudez/i)).toBeInTheDocument();
  });
});
