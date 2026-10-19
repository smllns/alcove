import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/shared/lib/motion';

type TypewriterProps = {
  text: string;
  // Wait before starting, so several lines can go one after another
  delay?: number;
  // Slows the whole thing down; big display type reads better unhurried
  pace?: number;
};

const ERASE_MS_PER_CHAR = 22;
const TYPE_MS_PER_CHAR = 38;
// Long lines speed up instead of dragging on
const MAX_ERASE_MS = 420;
const MAX_TYPE_MS = 820;
// The caret lingers a moment after the last letter lands
const CARET_LINGER_MS = 650;

const commonPrefix = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

// When `text` changes, backspaces the old text to where they differ, then
// types the new one, with a blinking caret while it works.
export function Typewriter({ text, delay = 0, pace = 1 }: TypewriterProps) {
  const [shown, setShown] = useState(text);
  const [caret, setCaret] = useState(false);
  // What's on screen right now, for an animation that starts mid-way through another
  const current = useRef(text);

  useEffect(() => {
    if (prefersReducedMotion || current.current === text) return;

    const from = current.current;
    const keep = commonPrefix(from, text);
    const erase = from.length - keep;
    const type = text.length - keep;
    const eraseMs = Math.min(MAX_ERASE_MS, erase * ERASE_MS_PER_CHAR) * pace;
    const typeMs = Math.min(MAX_TYPE_MS, type * TYPE_MS_PER_CHAR) * pace;

    let frame = 0;
    let start = 0;
    const show = (value: string) => {
      if (value === current.current) return;
      current.current = value;
      setShown(value);
    };

    const step = (now: number) => {
      start ||= now;
      const t = now - start - delay;
      if (t < 0) {
        frame = requestAnimationFrame(step);
        return;
      }
      setCaret(true);
      if (t < eraseMs) {
        const gone = Math.ceil((t / eraseMs) * erase);
        show(from.slice(0, from.length - gone));
      } else if (t < eraseMs + typeMs) {
        const typed = Math.floor(((t - eraseMs) / typeMs) * type);
        show(text.slice(0, keep + typed));
      } else {
        show(text);
        if (t > eraseMs + typeMs + CARET_LINGER_MS * Math.sqrt(pace)) {
          setCaret(false);
          return;
        }
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      setCaret(false);
    };
  }, [text, delay, pace]);

  // One inline box, so in a flex parent (a button) it's a single item
  return (
    <span>
      {prefersReducedMotion ? text : shown}
      {/* Keeps the line's height while it's momentarily empty */}
      {!shown && '\u200b'}
      {/* The caret takes no room, so the text never shifts as it comes and goes */}
      <span aria-hidden className='relative inline-block w-0'>
        <span
          className={`absolute bottom-[-0.12em] left-[0.05em] block h-[0.9em] w-[0.08em] min-w-px transition-opacity duration-500 ease-soft ${caret ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className='block size-full animate-[caret-blink_0.9s_steps(1)_infinite] bg-current' />
        </span>
      </span>
    </span>
  );
}
