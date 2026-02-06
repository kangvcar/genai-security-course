import { RootProvider } from 'fumadocs-ui/provider/next';
import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import './global.css';
import { Inter } from 'next/font/google';
import { AISearch, AISearchTrigger, AISearchPanel, AISearchMainContent } from '@/components/search';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://genai-security.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GenAI 安全攻防实战课程',
    template: '%s | GenAI 安全攻防实战课程',
  },
  description: '系统掌握大语言模型和 AI 系统的安全攻防技术。涵盖提示词注入、对抗样本、隐私窃取、数据投毒等核心主题，5大模块、24章精讲、15个动手实验，从理论到实战全面学习 AI 安全。',
  keywords: [
    'AI安全',
    'GenAI安全',
    '大语言模型安全',
    'LLM安全',
    '提示词注入',
    'Prompt Injection',
    '对抗样本',
    'Adversarial Examples',
    '隐私攻击',
    '数据投毒',
    'AI红队',
    'AI渗透测试',
    '机器学习安全',
    'OWASP AI Top 10',
    '越狱攻击',
    'Jailbreak',
  ],
  authors: [{ name: 'GenAI Security Team' }],
  creator: 'GenAI Security Team',
  publisher: 'GenAI Security Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteUrl,
    siteName: 'GenAI 安全攻防实战课程',
    title: 'GenAI 安全攻防实战课程',
    description: '系统掌握大语言模型和 AI 系统的安全攻防技术。涵盖提示词注入、对抗样本、隐私窃取、数据投毒等核心主题。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GenAI 安全攻防实战课程',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GenAI 安全攻防实战课程',
    description: '系统掌握大语言模型和 AI 系统的安全攻防技术。涵盖提示词注入、对抗样本、隐私窃取、数据投毒等核心主题。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  category: 'education',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MDDBLZ3WFM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MDDBLZ3WFM');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen">
        <AISearch>
          <div className="flex flex-1 w-full">
            <AISearchMainContent>
              <RootProvider>
                <I18nProvider
                  locale="zh-CN"
                  translations={{
                    toc: '目录导航',
                  }}
                >
                  {children}
                </I18nProvider>
              </RootProvider>
            </AISearchMainContent>
            <AISearchPanel />
          </div>
          <AISearchTrigger />
        </AISearch>
      </body>
    </html>
  );
}
