import { useRef, useState } from 'react';
import type { ListOpenState } from '@/entities/list/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { Collapse } from '@/shared/ui/Collapse';
import { ListsFound, useListsFound } from '@/widgets/library-header';
import { BookSearch } from '../views/BookSearch';
import { FoundBy } from '../views/FoundPanel';

// The most of each kind shown before "See all"
const FEW = 4;

// A list looked for by its name, by the lists: the reader's own, other
// readers' public ones, and Open Library's, as the search over everything
// finds them (ListsFound)
export function ListsFinder({ className }: { className?: string }) {
  const field = useRef<HTMLLabelElement>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const phone = useMediaQuery(PHONE);
  const navigate = useTransitionNavigate();
  const typed = useDebouncedValue(text.trim(), 300);
  const query = text.trim() ? typed : '';
  const found = useListsFound(query, text.trim() !== query);

  const go = (to: string, state?: ListOpenState) => {
    setOpen(false);
    setText('');
    void navigate(to, 'forward', { state });
  };

  return (
    <FoundBy
      field={
        <BookSearch
          ref={field}
          grows={false}
          value={text}
          onChange={(next) => {
            setText(next);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={phone ? () => setOpen(false) : undefined}
          placeholder='Find a list'
          className={phone ? 'w-full' : className}
        />
      }
      anchor={field}
      open={open && text.trim().length >= 2}
      onClose={() => setOpen(false)}
      width={380}
      className={className}
    >
      <ListsFound found={found} few={FEW} onOpen={go} />
      {/* Opening as the sections fold away, so it all moves as one */}
      <Collapse open={!found.looking && !found.some && Boolean(query)}>
        <p className='px-3 py-6 text-center text-sm text-muted'>
          No lists by that name.
        </p>
      </Collapse>
    </FoundBy>
  );
}
