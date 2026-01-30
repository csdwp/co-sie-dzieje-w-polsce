import { MetadataRoute } from 'next';

const siteUrl = 'https://coprzeszlo.pl';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
