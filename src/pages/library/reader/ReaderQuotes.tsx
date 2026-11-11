import type { ReaderPage } from '@/entities/reader/types';
import { PagePart } from './PagePart';

// How many are shown
const FEW = 6;

// What a reader wrote down from their books, the latest books first, each
// with where it's from
export function ReaderQuotes({ page }: { page: ReaderPage }) {
  const quotes = page.books
    .flatMap((book) => (book.quotes ?? []).map((text) => ({ text, book })))
    .slice(0, FEW);
  if (!page.shows.quotes || !quotes.length) return null;
  return (
    <PagePart title='Quotes' part='quotes' page={page}>
      <div className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
        {quotes.map(({ text, book }, i) => (
          <blockquote key={i} className='border-l-2 border-gold py-1 pl-5'>
            <p className='font-serif text-[1.0625rem] italic leading-relaxed'>
              {text}
            </p>
            <cite className='mt-2 block text-xs not-italic text-muted'>
              {book.title} · {book.authors.join(', ')}
            </cite>
          </blockquote>
        ))}
      </div>
    </PagePart>
  );
}
