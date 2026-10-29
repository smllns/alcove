import type { ReactNode } from 'react';
import type { AuthorFound, Book, CatalogueWork } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { ownBookLine } from '@/entities/book/ui/ownBookLine';
import { handle, type Reader } from '@/entities/user/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { Avatar } from '@/shared/ui/Avatar';
import { RoundPhoto } from '@/shared/ui/RoundPhoto';

const rowClass =
  'group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/6 focus-visible:bg-ink/6 focus-visible:outline-none';

// A row found, fading in as it comes, and saying what it does on the
// right as it's hovered (or all along, `noted`)
export function Row({
  onClick,
  hint,
  noted = false,
  order,
  children,
}: {
  onClick?: () => void;
  hint?: string;
  noted?: boolean;
  // Its place in its section, so the rows come in one after another
  order: number;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className='flex min-w-0 flex-1 items-center gap-3'>{children}</span>
      {hint && (
        <span
          className={cn(
            'shrink-0 text-xs text-muted transition-opacity duration-300 ease-soft',
            !noted &&
              'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
          )}
        >
          {hint}
        </span>
      )}
    </>
  );
  return (
    <li
      className='animate-arrive'
      style={{ animationDelay: `${Math.min(order, 8) * 40}ms` }}
    >
      {onClick ? (
        <button type='button' onClick={onClick} className={rowClass}>
          {inner}
        </button>
      ) : (
        <div className='flex items-center gap-3 px-3 py-2'>{inner}</div>
      )}
    </li>
  );
}

// One of the reader's own books; `action`, what choosing it does, said as
// it's hovered
export function OwnBookRow({
  book,
  order,
  onOpen,
  action = 'Open',
}: {
  book: Book;
  order: number;
  onOpen: () => void;
  action?: string;
}) {
  return (
    <Row onClick={onOpen} hint={action} order={order}>
      <BookLine size='sm' {...ownBookLine(book)} />
    </Row>
  );
}

// A book in the catalogue: its page, or the reader's own copy's if it's on
// the shelves
export function WorkRow({
  work,
  owned,
  order,
  onOpen,
  action = 'Open',
}: {
  work: CatalogueWork;
  owned: boolean;
  order: number;
  onOpen: () => void;
  action?: string;
}) {
  return (
    <Row
      onClick={onOpen}
      hint={owned ? 'On your shelves' : action}
      noted={owned}
      order={order}
    >
      <BookLine
        size='sm'
        title={work.title}
        byline={work.authors.slice(0, 2).join(', ') || 'Unknown author'}
        coverUrl={work.coverUrl}
        details={[work.firstPublishYear]}
      />
    </Row>
  );
}

// Another reader. Their page is still to come, so for now they're only
// found, not opened.
export function ReaderRow({
  reader,
  order,
}: {
  reader: Reader;
  order: number;
}) {
  const shownAs = handle(reader.username);
  return (
    <Row hint={reader.you ? 'You' : undefined} noted order={order}>
      <Avatar name={reader.name ?? shownAs} />
      <span className='min-w-0'>
        <span className='block truncate text-sm text-ink'>
          {reader.name ?? shownAs}
        </span>
        {reader.name && (
          <span className='block truncate text-xs text-muted'>{shownAs}</span>
        )}
      </span>
    </Row>
  );
}

// A writer's photo from the catalogue, small and round; their initial in
// a ring while it loads, and in its place if there's none
function AuthorPhoto({ author }: { author: AuthorFound }) {
  return (
    <span className='relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface font-serif text-sm text-ink-soft'>
      {author.name.charAt(0)}
      <RoundPhoto
        url={`https://covers.openlibrary.org/a/olid/${author.key}-M.jpg?default=false`}
        lazy
        className='absolute inset-0 size-full'
      />
    </span>
  );
}

// A writer, leading on to their books
export function AuthorRow({
  author,
  order,
  onOpen,
}: {
  author: AuthorFound;
  order: number;
  onOpen: () => void;
}) {
  const years = [author.born, author.died].filter(Boolean).join(' – ');
  const facts = [
    years,
    author.topWork,
    author.workCount > 1 && counted(author.workCount, 'book'),
  ].filter(Boolean);
  return (
    <Row onClick={onOpen} hint='Their books' order={order}>
      <AuthorPhoto author={author} />
      <span className='min-w-0'>
        <span className='block truncate text-sm text-ink'>{author.name}</span>
        <span className='block truncate text-xs text-muted'>
          {facts.join(' · ')}
        </span>
      </span>
    </Row>
  );
}
