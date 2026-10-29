import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { AddBookState } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { IconButton } from '@/shared/ui/IconButton';
import { Kbd } from '@/shared/ui/Kbd';
import { Modal } from '@/shared/ui/Modal';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { Spinner } from '@/shared/ui/Spinner';
import { solidRaisedClass } from '@/shared/ui/surfaces';
import type { ListOpenState } from '@/entities/list/types';
import { SearchFound } from './SearchFound';
import { useSearch, type SearchKind } from './useSearch';

const kinds: { value: SearchKind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'books', label: 'Books' },
  { value: 'authors', label: 'Authors' },
  { value: 'lists', label: 'Lists' },
  { value: 'people', label: 'Readers' },
];

// One search over everything, opened over the page (the whole screen, on
// a phone): the reader's own books, every book in the catalogue, other
// readers (@name), writers and lists
export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const field = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<SearchKind>('all');
  // Looked for once typing pauses; nothing at once when it's all cleared
  const typed = useDebouncedValue(text.trim(), 300);
  const query = text.trim() ? typed : '';
  const found = useSearch(query, kind, text.trim() !== query);
  const navigate = useTransitionNavigate();

  // Somewhere found: the dialog goes, and then the page turns to it
  const next = useRef<(() => void) | null>(null);
  const go = (to: string, state?: AddBookState | ListOpenState) => {
    next.current = () => void navigate(to, 'forward', { state });
    onClose();
  };
  // A writer chosen: their books, looked for by name
  const booksBy = (name: string) => {
    setText(name);
    setKind('books');
    field.current?.focus();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onClosed={() => {
        // Opened next time, a fresh search, nothing from this one
        setText('');
        setKind('all');
        next.current?.();
        next.current = null;
      }}
      focus={field}
      motion='sheet'
      className={`fixed inset-x-0 bottom-0 top-10 flex flex-col overflow-hidden rounded-t-[22px] sm:inset-x-0 sm:bottom-auto sm:top-[10vh] sm:mx-auto sm:h-auto sm:max-h-[min(42rem,80vh)] sm:w-[calc(100%-4rem)] sm:max-w-2xl sm:rounded-[26px] ${solidRaisedClass}`}
    >
      <label
        data-grab
        className='flex shrink-0 touch-none items-center gap-3 border-b border-line/70 px-5 pb-4 pt-6 sm:touch-auto sm:px-7 sm:py-5'
      >
        <Search size={20} className='shrink-0 text-faint' />
        <input
          ref={field}
          // Not type=search: Escape there clears the text first, when here
          // it closes the search, as the hint says
          type='text'
          enterKeyHint='search'
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Books, @readers, authors, lists…'
          aria-label='Search'
          autoCapitalize='none'
          spellCheck={false}
          className='min-w-0 flex-1 bg-transparent font-serif text-xl tracking-[-0.01em] outline-none placeholder:text-faint sm:text-2xl'
        />
        {/* Looking: while typing, and till everything's in */}
        <span
          aria-hidden
          className={cn(
            'text-faint transition-opacity duration-300 ease-soft',
            found.looking ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Spinner />
        </span>
        <IconButton aria-label='Close' onClick={onClose} className='sm:hidden'>
          <X size={16} />
        </IconButton>
        <Kbd className='max-sm:hidden'>esc</Kbd>
      </label>
      <div
        role='radiogroup'
        aria-label='Look for'
        className='flex shrink-0 flex-wrap gap-2 px-5 pt-4 sm:px-7'
      >
        {kinds.map((each) => (
          <button
            key={each.value}
            type='button'
            role='radio'
            aria-checked={each.value === kind}
            onClick={() => setKind(each.value)}
            className={choiceClass(each.value === kind)}
          >
            {each.label}
          </button>
        ))}
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-6 pt-2 sm:px-4'>
        {/* What's found coming and going softly, never in a jump */}
        <SmoothHeight>
          <SearchFound
            found={found}
            query={query}
            kind={kind}
            onKind={setKind}
            onBook={(id) => go(paths.book(id))}
            onWork={(work) => go(paths.work(work.workKey), { work })}
            onAuthor={booksBy}
            onList={go}
          />
        </SmoothHeight>
      </div>
    </Modal>
  );
}
