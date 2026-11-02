import { useRef, useState } from 'react';
import { Check, ListChecks, ListPlus } from 'lucide-react';
import type { Book } from '@/entities/book/types';
import { useListChoice } from '@/features/lists/useListChoice';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { AddOwnPill } from '@/shared/ui/AddOwnPill';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { Popover } from '@/shared/ui/Popover';
import { useBookLists } from './useBookLists';

// One of two marks or words in the one place, fading as the other comes
const fade = '[grid-area:1/1] transition-opacity duration-300 ease-soft';

// Beside a book, the reader's own or one from the catalogue: a way to put
// it in one of their lists, or take it out, from a short menu of them all
// (a tick by those it's in), or to start a new list with it in. Once it's
// in any, the button says how many, so it's plain the book went in.
export function AddToList({ book }: { book: Book }) {
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { value, change, error } = useBookLists(book);
  const {
    lists,
    chosen: inLists,
    toggle,
    addNew,
    failed,
  } = useListChoice(value, change);
  // Those of its lists the reader still has, for the button to say so
  const shown = lists.filter((list) => inLists.has(list.id)).length;

  return (
    // The menu set right under the button, moving with it as the page
    // scrolls, and over whatever comes after it
    <div className='relative z-30'>
      <Button
        ref={button}
        variant='pill'
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(shown > 0 && 'border-ink')}
      >
        {/* Its mark and its words each giving way softly to the other */}
        <span className='grid'>
          <ListPlus size={14} className={cn(fade, shown > 0 && 'opacity-0')} />
          <ListChecks size={14} className={cn(fade, !shown && 'opacity-0')} />
        </span>
        {/* Both words in the one place, the button as wide as the wider,
            so nothing beside it moves as one gives way to the other */}
        <span className='grid'>
          <span
            aria-hidden={shown > 0}
            className={cn(fade, shown > 0 && 'opacity-0')}
          >
            Add to list
          </span>
          <span
            aria-hidden={!shown}
            className={cn(fade, !shown && 'opacity-0')}
          >
            In {counted(Math.max(shown, 1), 'list')}
          </span>
        </span>
      </Button>
      <Popover
        open={open}
        anchor={button}
        width={260}
        inline
        onClose={() => setOpen(false)}
      >
        <div className='flex flex-col p-1.5'>
          {lists.map((list) => {
            const on = inLists.has(list.id);
            return (
              <button
                key={list.id}
                type='button'
                role='menuitemcheckbox'
                aria-checked={on}
                onClick={() => toggle(list.id)}
                className='flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-300 ease-soft hover:bg-ink/6'
              >
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-sm border transition-colors duration-300 ease-soft',
                    on ? 'border-ink bg-ink text-surface' : 'border-line',
                  )}
                >
                  <Check
                    size={11}
                    strokeWidth={3}
                    className={cn(
                      'transition-[opacity,scale] duration-300 ease-soft',
                      on ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                    )}
                  />
                </span>
                <span className='truncate'>{list.name}</span>
              </button>
            );
          })}
          <div
            className={cn(
              'px-1 py-1',
              lists.length > 0 && 'border-t border-line/70',
            )}
          >
            <AddOwnPill
              onAdd={(typed) => void addNew(typed).catch(() => {})}
              placeholder='Its name, then Enter'
              label='A new list'
              maxLength={60}
            >
              New list
            </AddOwnPill>
          </div>
          <FormError message={error ?? failed} small className='px-2.5 pb-1' />
        </div>
      </Popover>
    </div>
  );
}
