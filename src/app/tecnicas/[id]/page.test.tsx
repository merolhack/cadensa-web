import { describe, it, expect } from 'vitest';
import { generateStaticParams, generateMetadata } from './page';

describe('Rutas Estáticas de Técnicas Clínicas (/tecnicas/[id])', () => {
  it('generateStaticParams debe retornar las 7 técnicas fonoaudiológicas', () => {
    const params = generateStaticParams();
    expect(params.length).toBe(7);
    const ids = params.map((p) => p.id);
    expect(ids).toContain('sts');
    expect(ids).toContain('easy_onset');
    expect(ids).toContain('light_contact');
    expect(ids).toContain('prolonged_speech');
    expect(ids).toContain('box_breathing');
    expect(ids).toContain('pull_out');
    expect(ids).toContain('cancellation');
  });

  it('generateMetadata debe retornar metadatos SEO específicos y canónicos para cada técnica', async () => {
    const metaSts = await generateMetadata({ params: Promise.resolve({ id: 'sts' }) });
    expect(metaSts.title).toContain('Habla Rítmica Silábica (STS)');
    expect(metaSts.description).toBeDefined();

    const metaEo = await generateMetadata({ params: Promise.resolve({ id: 'easy_onset' }) });
    expect(metaEo.title).toContain('Inicio Vocal Suave');
  });
});

