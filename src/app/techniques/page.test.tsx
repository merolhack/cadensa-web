import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TechniquePage, {
  generateStaticParams,
  generateMetadata,
} from './[slug]/page';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

describe('Technique Dynamic SEO Pages (/techniques/[slug]) - Unit Tests', () => {
  it('generateStaticParams devuelve los 7 slugs canónicos de las técnicas clínicas', () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(7);
    const slugs = params.map((p) => p.slug);
    expect(slugs).toContain('syllable-timed-speech');
    expect(slugs).toContain('easy-onset');
    expect(slugs).toContain('light-contact');
    expect(slugs).toContain('prolonged-speech');
    expect(slugs).toContain('box-breathing');
    expect(slugs).toContain('pull-out');
    expect(slugs).toContain('cancellation');
  });

  it('generateMetadata genera metadatos específicos, canonical y OpenGraph para la técnica', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'syllable-timed-speech' }),
    });

    expect(metadata.title).toContain('Habla Rítmica Silábica (STS)');
    expect(metadata.description).toContain('isocronía');
    expect(metadata.alternates?.canonical).toBe(
      'https://cadensa-web.pages.dev/techniques/syllable-timed-speech'
    );
    expect(metadata.openGraph?.url).toBe(
      'https://cadensa-web.pages.dev/techniques/syllable-timed-speech'
    );
  });

  it('renderiza el encabezado h1, video HD y protocolo clínico para syllable-timed-speech', async () => {
    const jsx = await TechniquePage({
      params: Promise.resolve({ slug: 'syllable-timed-speech' }),
    });
    render(jsx);

    expect(
      screen.getByRole('heading', { level: 1, name: /Habla Rítmica Silábica \(STS\)/i })
    ).toBeInTheDocument();

    // Video incrustado
    const video = screen.getByTitle(/Demostración clínica de Habla Rítmica Silábica/i);
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute(
      'src',
      '/media/techniques/syllable-timed-speech_avatar_final.mp4'
    );

    // Objetivo y protocolo
    expect(screen.getByText(/Objetivo Clínico Fonoaudiológico/i)).toBeInTheDocument();
    expect(screen.getByText(/Fundamento Neurobiológico/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo de Ejecución Paso a Paso/i)).toBeInTheDocument();

    // Botón de práctica
    expect(screen.getAllByRole('link', { name: /iniciar práctica|comenzar práctica/i }).length).toBeGreaterThan(0);
  });

  it('llama a notFound() si el slug proporcionado no corresponde a ninguna técnica', async () => {
    await TechniquePage({
      params: Promise.resolve({ slug: 'tecnica-inexistente-xyz' }),
    });

    expect(navigation.notFound).toHaveBeenCalled();
  });
});
