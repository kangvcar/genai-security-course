'use client';

import Link from 'next/link';
import { Moon, Sun, Sparkles, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/cn';
import { useAISearch } from './search';

export function DynamicIslandNav() {
  const { open, setOpen } = useAISearch();
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const openAISearch = () => {
    setOpen(true);
  };

  // Hide when AI panel is open
  if (open) return null;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
      <nav
        className={cn(
          'flex items-center gap-1 px-1.5 py-1.5',
          'bg-white/70 backdrop-blur-xl dark:bg-neutral-800',
          'rounded-full',
          'shadow-lg shadow-neutral-900/10 dark:shadow-black/40',
          'border border-neutral-200/80 dark:border-neutral-700'
        )}
      >
        {/* Course Name */}
        <Link
          href="/"
          className={cn(
            'px-3 sm:px-4 py-1.5 rounded-full',
            'text-xs sm:text-sm font-medium',
            'text-neutral-700 dark:text-neutral-100',
            'hover:bg-neutral-100/80 dark:hover:bg-neutral-700',
            'transition-colors'
          )}
        >
          <span className="hidden lg:inline">GenAI 安全攻防实战课程</span>
          <span className="hidden sm:inline lg:hidden">GenAI 安全</span>
          <ShieldCheck className="w-4 h-4 sm:hidden" />
        </Link>

        {/* Divider */}
        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />

        {/* AI Assistant Button */}
        <button
          onClick={openAISearch}
          className={cn(
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full',
            'text-xs sm:text-sm',
            'text-neutral-500 dark:text-neutral-300',
            'hover:bg-neutral-100/80 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100',
            'transition-colors'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI 助教</span>
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-full',
            'text-neutral-500 dark:text-neutral-300',
            'hover:bg-neutral-100/80 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-100',
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
