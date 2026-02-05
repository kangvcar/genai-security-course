'use client';

import Link from 'next/link';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/cn';
import { useAISearch } from './search';

export function DynamicIslandNav() {
  const { setOpen } = useAISearch();
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const openAISearch = () => {
    setOpen(true);
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <nav
        className={cn(
          'flex items-center gap-1 px-1.5 py-1.5',
          'bg-neutral-900 dark:bg-neutral-800',
          'rounded-full',
          'shadow-lg shadow-neutral-900/20 dark:shadow-black/40',
          'border border-neutral-800 dark:border-neutral-700'
        )}
      >
        {/* Course Name */}
        <Link
          href="/"
          className={cn(
            'px-4 py-1.5 rounded-full',
            'text-sm font-medium text-neutral-100',
            'hover:bg-neutral-800 dark:hover:bg-neutral-700',
            'transition-colors'
          )}
        >
          GenAI 安全
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-neutral-700" />

        {/* AI Assistant Button */}
        <button
          onClick={openAISearch}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            'text-sm text-neutral-300',
            'hover:bg-neutral-800 dark:hover:bg-neutral-700 hover:text-neutral-100',
            'transition-colors'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI 助教</span>
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-neutral-700" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-full',
            'text-neutral-300',
            'hover:bg-neutral-800 dark:hover:bg-neutral-700 hover:text-neutral-100',
            'transition-colors'
          )}
          aria-label="切换主题"
        >
          <Sun className="w-4 h-4 hidden dark:block" />
          <Moon className="w-4 h-4 block dark:hidden" />
        </button>
      </nav>
    </header>
  );
}
