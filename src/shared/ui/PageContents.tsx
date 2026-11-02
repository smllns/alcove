import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { numeral } from '@/shared/lib/numerals';

export type ContentsPart = { id: string; label: string; danger?: boolean };

// A page's parts listed as a book's contents are, with dots leading over
// to their numerals; the one being read (`shown`, useReadingAt) marked,
// and each a way down to its part (`onGo`, by id). One that's `danger`
// (a part that can't be undone), in red.
export function PageContents({
  label,
  parts,
  shown,
  onGo,
  number = (i) => (
    <span className='font-sans text-[11px] tracking-[0.1em] text-faint'>
      {numeral(i)}
    </span>
  ),
}: {
  label: string;
  parts: ContentsPart[];
  shown: string;
  onGo: (id: string) => void;
  // How each is numbered, from 0: in roman numerals, unless given
  number?: (i: number) => ReactNode;
}) {
  return (
    <nav aria-label={label} className='flex flex-col'>
      {parts.map(({ id, label: name, danger }, i) => {
        const on = id === shown;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={on ? 'location' : undefined}
            onClick={(e) => {
              e.preventDefault();
              onGo(id);
            }}
            className={cn(
              'group flex items-baseline gap-2 py-2 font-serif text-[17px] transition-colors duration-500 ease-soft',
              danger
                ? 'text-danger/80 hover:text-danger'
                : on
                  ? 'text-ink'
                  : 'text-muted hover:text-ink',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-1.5 shrink-0 -translate-y-0.75 rounded-full bg-accent transition-opacity duration-500 ease-soft',
                on ? 'opacity-100' : 'opacity-0',
              )}
            />
            {name}
            <span
              aria-hidden
              className='flex-1 -translate-y-1 border-b border-dotted border-line'
            />
            {number(i)}
          </a>
        );
      })}
    </nav>
  );
}
