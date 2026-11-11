import { catalogueBook } from '@/entities/book/catalogueBook';
import type { SimilarBook } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { TitledSection } from '@/shared/ui/TitledSection';
import { WantToRead } from '../WantToRead';

// The writer's book to read next: of those the reader hasn't, the one most
// read on Open Library (the most readers have it in their reading logs,
// as the catalogue ranks a writer's books), set apart and large, its cover
// and title opening its page, and a way to put it in Want to read
export function AuthorNext({ work }: { work: SimilarBook }) {
  const page = { to: paths.work(work.workKey), state: { work } };
  return (
    <TitledSection title='Read next'>
      <div className='grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-5 rounded-[20px] border border-gold/30 bg-gold/8 p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-7 sm:p-6'>
        <TransitionLink {...page} className='group block'>
          <BookCover
            title={work.title}
            author={work.authors[0]}
            url={work.coverUrl}
            className='shadow-[0_14px_22px_-12px_rgb(var(--shade)/calc(0.55*var(--shade-k)))] transition-transform duration-500 ease-soft group-hover:-translate-y-1'
          />
        </TransitionLink>
        <div className='min-w-0'>
          <p className='text-xs uppercase tracking-[0.14em] text-muted'>
            Their most read that you don’t have
          </p>
          <TransitionLink
            {...page}
            className='mt-1.5 block font-serif text-2xl leading-tight text-balance text-ink hover:underline hover:decoration-line hover:underline-offset-4 sm:text-3xl'
          >
            {work.title}
          </TransitionLink>
          <p className='mt-1.5 text-sm text-ink-soft'>
            {[
              work.firstPublishYear,
              work.editionCount > 1 && counted(work.editionCount, 'edition'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className='mt-4'>
            <WantToRead book={catalogueBook(work)} />
          </div>
        </div>
      </div>
    </TitledSection>
  );
}
