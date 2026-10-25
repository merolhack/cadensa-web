import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage, { metadata } from './page';

describe('AboutPage - Unit Tests', () => {
  it('debe contener los metadatos SEO adecuados para la página de Acerca de', () => {
    expect(metadata.title).toContain('Acerca de Cadensa');
    expect(metadata.description).toBeDefined();
  });

  it('debe renderizar el título principal y la misión del sitio', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /propósito, futuros pasos y liderazgo técnico/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/el propósito de cadensa/i)).toBeInTheDocument();
    expect(screen.getByText(/base neurobiológica \(sts\)/i)).toBeInTheDocument();
  });

  it('debe renderizar las secciones de hitos completados y futuros pasos del roadmap', () => {
    render(<AboutPage />);

    expect(screen.getByText(/hitos completados y operativos/i)).toBeInTheDocument();
    expect(screen.getByText(/futuros pasos en desarrollo activo/i)).toBeInTheDocument();
    expect(screen.getByText(/sincronización mandatoria • agents & wiki/i)).toBeInTheDocument();
  });

  it('debe incluir la referencia del autor Lenin Meza con sus enlaces a GitHub Pages y LinkedIn', () => {
    render(<AboutPage />);

    // Referencia del autor
    expect(screen.getByRole('heading', { level: 3, name: /lenin meza/i })).toBeInTheDocument();

    // Enlace a GitHub Pages
    const ghPagesLink = screen.getByRole('link', { name: /github pages/i });
    expect(ghPagesLink).toHaveAttribute('href', 'https://merolhack.github.io');
    expect(ghPagesLink).toHaveAttribute('target', '_blank');

    // Enlace a LinkedIn
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute('href', 'http://www.linkedin.com/in/leninmezazarco');
    expect(linkedinLink).toHaveAttribute('target', '_blank');

    // Enlace a perfil de GitHub
    const githubLink = screen.getByRole('link', { name: /github$/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/merolhack');
  });

  it('debe tener enlaces de retorno al inicio y a las estadísticas', () => {
    render(<AboutPage />);

    const returnHomeLink = screen.getByRole('link', { name: /volver al inicio/i });
    expect(returnHomeLink).toHaveAttribute('href', '/');

    const statsLinks = screen.getAllByRole('link', { name: /estadísticas/i });
    expect(statsLinks.length).toBeGreaterThanOrEqual(1);
    expect(statsLinks[0]).toHaveAttribute('href', '/stats');
  });
});
