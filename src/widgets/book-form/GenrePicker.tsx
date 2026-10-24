import { cn } from '@/shared/lib/cn';
import { AddOwnPill } from '@/shared/ui/AddOwnPill';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { labelClass } from '@/shared/ui/fieldStyles';

// The usual shelves of a bookshop, to pick from with a tap. The server
// picks these same ones out of the catalogue's subjects
// (server/src/lookup/genres.ts).
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

  const addOwn = (typed: string) => {
    const genre = typed.trim();
    if (!genre) return;
    // Typing one that's already there just picks it
    const known = shown.find((g) => g.toLowerCase() === genre.toLowerCase());
    if (!chosen.has((known ?? genre).toLowerCase())) toggle(known ?? genre);
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
        {!full && (
          <AddOwnPill
            onAdd={addOwn}
            placeholder='Your own, then Enter'
            label='Your own genre'
            maxLength={40}
            staysOpen
            className='w-44'
          >
            Your own
          </AddOwnPill>
        )}
      </div>
    </fieldset>
  );
}
