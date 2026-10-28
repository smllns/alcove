import { ArrowDown } from 'lucide-react';
import { lifespan } from '@/entities/book/authors';
import { useWorkAuthor } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { settled } from '@/shared/lib/settled';
import { Collapse } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { QuietButton } from '@/shared/ui/ListControls';
import { RoundPhoto } from '@/shared/ui/RoundPhoto';
import { Spinner } from '@/shared/ui/Spinner';
import { AUTHOR_SECTION } from './SameAuthor';
import { SourceCredit } from './SourceCredit';
import { useTheirOthers } from './useTheirOthers';
import { textLinkClass } from '@/shared/ui/buttonStyles';

const bioText =
  'whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink-soft';

// Who wrote the book, under its title: "by Zora Neale Hurston", a line
// that never changes. Below it, set in a little, what comes later than the
// page: the writer's face and years, the first lines of what's known about
// them (to read on in place), and how many more of theirs the reader has,
// which leads down to them. It waits for all of that (a spinner by the
// name meanwhile), then opens out softly once, rather than growing a piece
// at a time.
export function AuthorByline({ book }: { book: Book }) {
  const authorQuery = useWorkAuthor(book.openLibrary?.work);
  const author = authorQuery.data;
  const { others, known } = useTheirOthers(book);
  const years = lifespan(author);
  const more = others.length;
  const waiting = !settled(authorQuery) || !known;
  const ready =
    !waiting && Boolean(author?.bio || author?.photoUrl || years || more);

  return (
    <div
      className='animate-rise'
      style={{ animationDelay: '140ms' }}
      aria-busy={waiting || undefined}
    >
      <p className='mt-3 font-serif text-lg font-medium text-ink sm:mt-4 sm:text-xl'>
        <span className='font-normal text-muted italic'>by</span>{' '}
        {book.authors.join(', ')}
        {/* While what's known of them is still on its way; its place kept
            all along, so the line never moves */}
        <span
          className={cn(
            'ml-2.5 inline-flex align-middle text-faint transition-opacity duration-500 ease-soft',
            waiting ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Spinner />
        </span>
      </p>
      <Collapse open={ready} arriving>
        <div className='pt-4'>
          <div className='max-w-2xl border-l border-line pl-4'>
            {(author?.photoUrl || years) && (
              <div className='mb-3 flex items-center gap-3'>
                {author?.photoUrl && (
                  <RoundPhoto
                    url={author.photoUrl}
                    className='size-10 shrink-0 bg-line/40'
                  />
                )}
                {years && <span className='text-sm text-muted'>{years}</span>}
              </div>
            )}
            {author?.bio && (
              <>
                <Fold lines={3} className={bioText}>
                  {author.bio}
                </Fold>
                {author.wikipedia && (
                  <SourceCredit
                    source='Wikipedia'
                    href={author.wikipedia}
                    className='mt-2'
                  />
                )}
              </>
            )}
            {more > 0 && (
              <QuietButton
                onClick={() =>
                  document
                    .getElementById(AUTHOR_SECTION)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className={cn('group', textLinkClass, author?.bio && 'mt-2')}
              >
                {counted(more, 'more book')} by them on your shelves
                <ArrowDown
                  size={14}
                  aria-hidden
                  className='transition-transform duration-500 ease-soft group-hover:translate-y-0.5'
                />
              </QuietButton>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}
