import type { MetadataRoute } from 'next';
import { siteAbsoluteUrl } from '@/lib/paths';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal/', '/api/'],
      },
    ],
    sitemap: siteAbsoluteUrl('/sitemap.xml'),
  };
}
