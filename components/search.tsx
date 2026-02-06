'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Loader2, MessageCircleIcon, RefreshCw, Send, X } from 'lucide-react';
import { cn } from '../lib/cn';
import Link from 'fumadocs-core/link';
import { type UIMessage, useChat, type UseChatHelpers } from '@ai-sdk/react';
import type { ProvideLinksToolSchema } from '../lib/inkeep-qa-schema';
import type { z } from 'zod';
import { DefaultChatTransport } from 'ai';
import { Markdown } from './markdown';
import { Presence } from '@radix-ui/react-presence';

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
} | null>(null);

function useChatContext() {
  return use(Context)!.chat;
}

export function useAISearch() {
  const ctx = use(Context);
  return {
    open: ctx?.open ?? false,
    setOpen: ctx?.setOpen ?? (() => {}),
  };
}

const suggestedQuestions = [
  '什么是提示词注入攻击？',
  '如何防御越狱攻击？',
  '对抗样本的原理是什么？',
  '什么是成员推理攻击？',
];

function Header() {
  const { setOpen } = use(Context)!;

  return (
    <div className="sticky top-0 flex items-start gap-2">
      <div className="flex-1 p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">🛡️ AI 安全助教</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          随时为你解答 AI 安全相关问题
        </p>
      </div>
      <button
        aria-label="关闭"
        tabIndex={-1}
        className="inline-flex items-center justify-center p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors [&_svg]:size-4.5"
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  );
}

function WelcomeMessage() {
  const { sendMessage } = useChatContext();

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          👋 你好！我是 AI 安全课程的智能助教，可以帮你：
        </p>
        <ul className="text-xs text-neutral-500 dark:text-neutral-500 text-left space-y-1 mb-4 px-2">
          <li>• 解释课程中的安全概念和术语</li>
          <li>• 分析攻击原理和防御策略</li>
          <li>• 回答实验中遇到的问题</li>
          <li>• 提供学习建议和扩展资料</li>
        </ul>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">试试问我：</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              onClick={() => sendMessage({ text: q })}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchAIActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          重新回答
        </button>
      )}
      <button
        type="button"
        className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        onClick={() => setMessages([])}
      >
        清空对话
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
function SearchAIInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    void sendMessage({ text: input });
    setInput('');
  };

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem(StorageKeyInput);
    if (saved) setInput(saved);
  }, []);

  // Save to localStorage when input changes
  useEffect(() => {
    localStorage.setItem(StorageKeyInput, input);
  }, [input]);

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? 'AI 正在思考...' : '输入你的问题...'}
        autoFocus
        className="p-3"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className="inline-flex items-center justify-center gap-2 p-2 rounded-full mt-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all text-sm font-medium"
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-neutral-400" />
          停止
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className="inline-flex items-center justify-center p-2 rounded-full mt-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:pointer-events-none transition-all text-sm font-medium"
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-neutral-100 focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: '你',
  assistant: 'AI 助教',
};

function Message({ message, ...props }: { message: UIMessage } & ComponentProps<'div'>) {
  let markdown = '';
  let links: z.infer<typeof ProvideLinksToolSchema>['links'] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type === 'tool-provideLinks' && part.input) {
      links = (part.input as z.infer<typeof ProvideLinksToolSchema>).links;
    }
  }

  return (
    <div {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-neutral-400 dark:text-neutral-500',
          message.role === 'assistant' && 'text-neutral-900 dark:text-neutral-100',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      <div className="prose text-sm text-neutral-700 dark:text-neutral-300">
        <Markdown text={markdown} />
      </div>
      {links && links.length > 0 && (
        <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
          {links.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="block text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-neutral-500 dark:text-neutral-500">Reference {item.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
  );
}

export function AISearchMainContent({ children }: { children: ReactNode }) {
  const { open } = use(Context)!;

  return (
    <div
      className={cn(
        'flex-1 min-w-0 transition-all duration-300 ease-in-out',
        open && 'lg:mr-0'
      )}
      style={{
        width: open ? 'calc(100% - var(--ai-chat-width, 400px))' : '100%',
      }}
    >
      {children}
    </div>
  );
}

export function AISearchTrigger() {
  const { open, setOpen } = use(Context)!;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center fixed bottom-4 gap-2 px-4 py-2 text-sm font-medium',
        'end-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))]',
        'bg-white/70 dark:bg-neutral-800 backdrop-blur-xl',
        'text-neutral-500 dark:text-neutral-400',
        'border border-neutral-200/80 dark:border-neutral-700',
        'rounded-2xl shadow-lg shadow-neutral-900/10 dark:shadow-black/40',
        'hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-700',
        'z-20 transition-[translate,opacity,colors]',
        open && 'translate-y-10 opacity-0',
      )}
      onClick={() => setOpen(true)}
    >
      <MessageCircleIcon className="size-4.5" />
      AI 助教
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = use(Context)!;
  const chat = useChatContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);

  return (
    <>
      <style>
        {`
        :root {
          --ai-chat-width: 400px;
        }
        @media (min-width: 1280px) {
          :root {
            --ai-chat-width: 420px;
          }
        }
        `}
      </style>
      {/* Mobile overlay */}
      <Presence present={open}>
        <div
          data-state={open ? 'open' : 'closed'}
          className="fixed inset-0 z-30 backdrop-blur-xs bg-black/20 dark:bg-black/40 data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out lg:hidden"
          onClick={() => setOpen(false)}
        />
      </Presence>
      {/* AI Panel */}
      <div
        className={cn(
          'bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 border-l border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out',
          // Mobile: fixed overlay
          'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:shadow-xl',
          // Desktop: sticky sidebar
          'lg:sticky lg:top-0 lg:h-dvh lg:flex-shrink-0',
          open
            ? 'w-[min(90vw,var(--ai-chat-width))] lg:w-[var(--ai-chat-width)]'
            : 'w-0 border-l-0 overflow-hidden',
        )}
      >
        <div className="flex flex-col px-2 py-4 size-full lg:w-[var(--ai-chat-width)] xl:px-4 xl:py-6">
          <Header />
          <List
            className="px-3 py-4 flex-1 overscroll-contain"
            style={{
              maskImage:
                'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
            }}
          >
            <div className="flex flex-col gap-4">
              {chat.messages
                .filter((msg) => msg.role !== 'system')
                .map((item) => (
                  <Message key={item.id} message={item} />
                ))}
            </div>
          </List>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 has-focus-visible:ring-2 has-focus-visible:ring-neutral-400 dark:has-focus-visible:ring-neutral-600">
            <SearchAIInput />
            <div className="flex items-center gap-1.5 p-1 empty:hidden">
              <SearchAIActions />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
