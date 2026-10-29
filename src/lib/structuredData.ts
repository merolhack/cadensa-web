/**
 * Datos estructurados JSON-LD (Schema.org) de Cadensa para SEO en Google y Bing.
 * Enriquecido para fonoaudiología, tartamudez infantil, habla rítmica y biofeedback acústico.
 */
export const SITE_URL = 'https://cadensa-web.pages.dev';

export const CADENSA_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Cadensa',
      alternateName: 'Cadensa — Gimnasio Digital de Fluidez del Habla y Fonoaudiología',
      url: `${SITE_URL}/`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS Safari, Google Chrome, Microsoft Edge, Mozilla Firefox, Opera',
      inLanguage: 'es',
      description:
        'Suite fonoaudiológica interactiva con metrónomo de ultra-baja latencia, biofeedback de formantes F1/F2, diadococinesia oral, telesalud P2P y Cadensa Kids para fluidez del habla.',
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
      name: 'Entrenamiento de Fluidez del Habla, Disfemia Temprana y Habla Rítmica — Cadensa',
      url: `${SITE_URL}/`,
      inLanguage: 'es',
      specialty: 'Speech-Language Pathology',
      about: [
        { '@type': 'MedicalCondition', name: 'Tartamudez y Disfluencia del Habla (Disfemia)' },
        { '@type': 'MedicalCondition', name: 'Disfemia Infantil del Desarrollo' },
      ],
      significantLink: [
        `${SITE_URL}/about`,
        `${SITE_URL}/tecnicas/sts`,
        `${SITE_URL}/tecnicas/easy_onset`,
        `${SITE_URL}/tecnicas/light_contact`,
      ],
    },
    {
      '@type': 'EducationalOccupationalProgram',
      '@id': `${SITE_URL}/#kids_program`,
      name: 'Cadensa Kids — Aventura del Habla Suave',
      description: 'Módulo interactivo de habla rítmica con avatares animales para niños con disfemia temprana.',
      provider: {
        '@type': 'Organization',
        name: 'Cadensa',
        url: `${SITE_URL}/`,
      },
      educationalCredentialAwarded: 'Estrellas de Fluidez Pediátrica',
    },
  ],
};
