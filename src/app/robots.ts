import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin'],
      },
    ],
    sitemap: 'https://cadensa-web.pages.dev/sitemap.xml',
    host: 'https://cadensa-web.pages.dev',
  };
}

