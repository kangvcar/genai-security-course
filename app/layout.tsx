import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { AISearch, AISearchTrigger, AISearchPanel } from '@/components/search';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <AISearch>
          <AISearchTrigger />
          <AISearchPanel />
          <RootProvider>{children}</RootProvider>
        </AISearch>
      </body>
    </html>
  );
}
