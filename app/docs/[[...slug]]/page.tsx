import { getPageImage, source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/ai/page-actions';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const gitConfig = {
    user: 'username',
    repo: 'repo',
    branch: 'main',
  };

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          // update it to match your repo
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://genai-security.vercel.app';
  const pageUrl = `${siteUrl}${page.url}`;
  const imageUrl = getPageImage(page).url;

  return {
    title: page.data.title,
    description: page.data.description || `学习 ${page.data.title} - GenAI 安全攻防实战课程`,
    keywords: [
      'AI安全',
      'GenAI',
      page.data.title,
      ...(page.slugs || []),
      ...(page.data.keywords
        ? page.data.keywords.split(',').map((k: string) => k.trim())
        : []),
    ],
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      url: pageUrl,
      title: page.data.title,
      description: page.data.description || `学习 ${page.data.title} - GenAI 安全攻防实战课程`,
      siteName: 'GenAI 安全攻防实战课程',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description || `学习 ${page.data.title} - GenAI 安全攻防实战课程`,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}
