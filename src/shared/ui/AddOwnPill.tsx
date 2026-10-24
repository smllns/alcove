import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { smallInputText } from './fieldStyles';
import { AddButton } from './ListControls';

// At the end of a row of pills to pick from, a way to add one of the
// reader's own: a quiet "+", opening into a pill to type in. Enter adds
// what's typed (and, with `staysOpen`, leaves room for another), leaving
// the pill adds it too, Escape lets it go. `onAdd` is told what was typed
// as it was typed.
export function AddOwnPill({
  children,
  onAdd,
  placeholder,
  label,
  maxLength,
  staysOpen = false,
  className,
}: {
  // On the "+" before it opens
  children: ReactNode;
  onAdd: (text: string) => void;
  placeholder: string;
  // What the field is, for those who can't see it
  label: string;
  maxLength: number;
  staysOpen?: boolean;
  // Its width, say
  className?: string;
}) {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);

  const add = (close: boolean) => {
    onAdd(text);
    setText('');
    if (close) setTyping(false);
  };

  if (!typing)
    return (
      <AddButton onClick={() => setTyping(true)} className='px-2'>
        {children}
      </AddButton>
    );
  return (
    <input
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        // Enter adds it rather than sending the form on
        if (e.key === 'Enter') {
          e.preventDefault();
          add(!staysOpen);
        }
        if (e.key === 'Escape') setTyping(false);
      }}
      onBlur={() => add(true)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={label}
      className={cn(
        'rounded-full border border-ink bg-transparent px-4 py-1.5 text-ink outline-none placeholder:text-faint',
        smallInputText,
        className,
      )}
    />
  );
}
