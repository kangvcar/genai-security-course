import { RootProvider } from 'fumadocs-ui/provider/next';
import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import './global.css';
import { Inter } from 'next/font/google';
import { AISearch, AISearchTrigger, AISearchPanel, AISearchMainContent } from '@/components/search';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
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
