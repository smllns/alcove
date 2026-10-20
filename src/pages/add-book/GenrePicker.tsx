import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { labelClass } from '@/shared/ui/fieldStyles';
import { AddButton } from '@/shared/ui/ListControls';

// The usual shelves of a bookshop, to pick from with a tap
const common = [
  'Fiction',
  'Non-fiction',
  'Classics',
  'Fantasy',
  'Science fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Poetry',
  'History',
  'Biography',
  'Philosophy',
  'Science',
  'Self-help',
  'Children’s',
  'Graphic novel',
];

const MAX = 10;

// Genres as pills to toggle, plus any of the reader's own
export function GenrePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (genres: string[]) => void;
}) {
  const [own, setOwn] = useState('');
  const [typing, setTyping] = useState(false);
  const chosen = new Set(value.map((g) => g.toLowerCase()));
  // The common ones, then whatever the reader added that isn't among them
  const shown = [
    ...common,
    ...value.filter(
      (g) => !common.some((c) => c.toLowerCase() === g.toLowerCase()),
    ),
  ];
  const full = value.length >= MAX;

  const toggle = (genre: string) =>
    onChange(
      chosen.has(genre.toLowerCase())
        ? value.filter((g) => g.toLowerCase() !== genre.toLowerCase())
        : full
          ? value
          : [...value, genre],
    );

  const addOwn = () => {
    const genre = own.trim();
    if (!genre) return;
    // Typing one that's already there just picks it
    const known = shown.find((g) => g.toLowerCase() === genre.toLowerCase());
    if (!chosen.has((known ?? genre).toLowerCase())) toggle(known ?? genre);
    setOwn('');
  };

  return (
    <fieldset>
      <legend className={cn('mb-3', labelClass)}>Genres</legend>
      <div className='flex flex-wrap items-center gap-2'>
        {shown.map((genre) => {
          const on = chosen.has(genre.toLowerCase());
          return (
            <button
              key={genre}
              type='button'
              aria-pressed={on}
              onClick={() => toggle(genre)}
              disabled={!on && full}
              className={cn(
                choiceClass(on),
                'py-1.5 disabled:cursor-default disabled:opacity-40',
              )}
            >
              {genre}
            </button>
          );
        })}
        {typing ? (
          <input
            autoFocus
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            onKeyDown={(e) => {
              // Enter adds the genre rather than moving on to the next step
              if (e.key === 'Enter') {
                e.preventDefault();
                addOwn();
              }
              if (e.key === 'Escape') setTyping(false);
            }}
            onBlur={() => {
              addOwn();
              setTyping(false);
            }}
            placeholder='Your own, then Enter'
            maxLength={40}
            aria-label='Your own genre'
            className='w-44 rounded-full border border-ink bg-transparent px-4 py-1.5 text-sm text-ink outline-none placeholder:text-faint'
          />
        ) : (
          !full && (
            <AddButton onClick={() => setTyping(true)} className='px-2'>
              Your own
            </AddButton>
          )
        )}
      </div>
    </fieldset>
  );
}
