/**
 * Datos estructurados JSON-LD (Schema.org) de Cadensa para SEO en Google y Bing.
 */
export const SITE_URL = 'https://cadensa-web.pages.dev';

export const CADENSA_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Cadensa',
      alternateName: 'Cadensa — Gimnasio Digital de Fluidez del Habla',
      url: `${SITE_URL}/`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS, Android',
      inLanguage: 'es',
      description:
        'Plataforma interactiva de entrenamiento de fluidez del habla basada en Habla Rítmica Silábica (STS), Inicio Vocal Suave y técnicas de Van Riper.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: {
        '@type': 'Person',
        name: 'Lenin Meza',
        url: 'https://merolhack.github.io',
        sameAs: ['http://www.linkedin.com/in/leninmezazarco', 'https://github.com/merolhack'],
      },
    },
    {
      '@type': 'MedicalWebPage',
      '@id': `${SITE_URL}/#medicalpage`,
      name: 'Entrenamiento de Fluidez y Habla Rítmica Silábica — Cadensa',
      url: `${SITE_URL}/`,
      inLanguage: 'es',
      specialty: 'Speech-Language Pathology',
      about: { '@type': 'MedicalCondition', name: 'Tartamudez y Disfluencia del Habla' },
    },
  ],
};

