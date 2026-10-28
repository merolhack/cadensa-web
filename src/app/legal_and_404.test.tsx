import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage, { metadata as privacyMeta } from './privacy/page';
import TermsPage, { metadata as termsMeta } from './terms/page';
import NotFound from './not-found';

describe('Páginas Legales y Error 404 (Fase A y C)', () => {
  it('PrivacyPage debe renderizar aviso de procesamiento Zero Trust y política de cookies', () => {
    expect(privacyMeta.title).toContain('Política de Privacidad');
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/política de privacidad/i);
    expect(screen.getByText(/procesamiento local de voz/i)).toBeInTheDocument();
    expect(screen.getByText(/ca-pub-2700240339792942/)).toBeInTheDocument();
  });

  it('TermsPage debe renderizar el Descargo Médico / Medical Disclaimer (YMYL)', () => {
    expect(termsMeta.title).toContain('Términos de Uso');
    render(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/términos de uso/i);
    expect(screen.getByText(/descargo de responsabilidad fonoaudiológica/i)).toBeInTheDocument();
    expect(screen.getByText(/no constituyen consejo médico/i)).toBeInTheDocument();
  });

  it('NotFound (404) debe renderizar mensaje empático y enlaces de retorno', () => {
    render(<NotFound />);
    expect(screen.getByText(/error 404/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir al catálogo de técnicas/i })).toHaveAttribute('href', '/');
  });
});

