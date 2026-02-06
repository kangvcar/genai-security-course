'use client';

import { useEffect, useState, useCallback } from 'react';

interface TypingRotatorProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypingRotator({
  words,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseDuration = 2000,
  className,
}: TypingRotatorProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentWord = words[currentWordIndex];

  const tick = useCallback(() => {
    if (isPaused) return;

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentWord.length) {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [displayText, isDeleting, isPaused, currentWord, words.length, pauseDuration]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, typingSpeed, deletingSpeed]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-block w-[2px] h-[1em] bg-neutral-900 dark:bg-neutral-100 ml-0.5 align-baseline animate-blink" />
    </span>
  );
}
