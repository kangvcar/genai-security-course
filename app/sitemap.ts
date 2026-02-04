import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://genai-security.vercel.app';
  
  // 获取所有文档页面
  const pages = source.getPages();
  
  const docsPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: page.slugs.length === 0 ? 0.9 : 0.8,
  }));

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  return [...staticPages, ...docsPages];
}
