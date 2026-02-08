'use client';

import { useState, useCallback } from 'react';

interface QuizOption {
  label: string;
  correct?: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
}

function QuizQuestion({
  q,
  index,
}: {
  q: QuizQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correctIndex = q.options.findIndex((o) => o.correct);

  const handleSelect = useCallback(
    (i: number) => {
      if (revealed) return;
      setSelected(i);
      setRevealed(true);
    },
    [revealed],
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let borderColor = 'border-neutral-200 dark:border-neutral-700';
          let bg = 'bg-white dark:bg-neutral-900';
          let ring = '';

          if (revealed) {
            if (i === correctIndex) {
              borderColor = 'border-green-500 dark:border-green-500';
              bg = 'bg-green-50 dark:bg-green-950/30';
            } else if (i === selected && i !== correctIndex) {
              borderColor = 'border-red-400 dark:border-red-500';
              bg = 'bg-red-50 dark:bg-red-950/30';
            }
          } else {
            ring = 'hover:border-neutral-400 dark:hover:border-neutral-500 cursor-pointer';
          }

          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${borderColor} ${bg} ${ring} ${
                revealed ? 'cursor-default' : ''
              }`}
            >
              <span className="text-neutral-600 dark:text-neutral-400 mr-2 font-mono text-xs">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="text-neutral-800 dark:text-neutral-200">
                {opt.label}
              </span>
              {revealed && i === correctIndex && (
                <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ 正确</span>
              )}
              {revealed && i === selected && i !== correctIndex && (
                <span className="ml-2 text-red-500 dark:text-red-400 text-xs">✗ 错误</span>
              )}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            <span className="font-medium">💡 解析：</span>
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export function Quiz({ questions }: QuizProps) {
  const [score, setScore] = useState<number | null>(null);

  return (
    <div className="my-6 space-y-4">
      {questions.map((q, i) => (
        <QuizQuestion key={i} q={q} index={i} />
      ))}
    </div>
  );
}
