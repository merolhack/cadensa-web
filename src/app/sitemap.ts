import type { MetadataRoute } from 'next';
import { CLINICAL_TECHNIQUES, CANONICAL_TECHNIQUE_SLUGS } from '@/lib/clinicalTechniques';

export const dynamic = 'force-static';

const BASE_URL = 'https://cadensa-web.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Rutas reales e indexables de las 7 técnicas fonoaudiológicas (/techniques/[slug])
  const techniqueSeoRoutes: MetadataRoute.Sitemap = Object.values(CANONICAL_TECHNIQUE_SLUGS).map(
    (slug) => ({
      url: `${BASE_URL}/techniques/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  );

  // Retrocompatibilidad con rutas en español (/tecnicas/[id])
  const legacyTechniqueRoutes: MetadataRoute.Sitemap = Object.keys(CLINICAL_TECHNIQUES).map((id) => ({
    url: `${BASE_URL}/tecnicas/${id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...techniqueSeoRoutes, ...legacyTechniqueRoutes];
}
