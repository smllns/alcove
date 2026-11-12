import type { Book } from '@/entities/book/types';
import type { ReaderPage } from '@/entities/reader/types';
import type { Tally } from '@/entities/book/tallies';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { authors } from '@/entities/book/favouriteAuthors';
import { useWritersKnown } from '@/entities/book/writers';
import { BooksDrawer, HoverBooks, useBooksDrawer } from '@/widgets/book-cards';
import { asBook } from './readerBooks';
import { PagePart } from './PagePart';

// How many are shown
const FEW = 5;

// The writers a reader has most books by (each once, however their name's
// written, as in the stats), each a bar as long as their share; their
// books open as the stats' authors' do (HoverBooks): pointed at, in a card
// over the row, with the way to the writer's page (clicked, it goes
// there); tapped, in a drawer
export function FavouriteWriters({
  page,
  owned,
}: {
  page: ReaderPage;
  owned: Map<string, Book>;
}) {
  const hover = useMediaQuery(HOVER);
  const drawer = useBooksDrawer();
  // Drawn again as more writers are known to be one
  useWritersKnown();
  if (!page.shows.books) return null;
  const rows = authors(page.books.map((book) => asBook(book, owned)))
    .filter((row) => row.books.length > 1)
    .slice(0, FEW);
  if (!rows.length) return null;
  const most = rows[0].books.length;
  const pageOf = (row: Tally) => ({
    to: paths.author(row.name),
    label: 'Author’s page',
  });
  return (
    <PagePart title='Favourite authors' part='books' page={page}>
      <ul className='flex flex-col gap-3'>
        {rows.map((row) => (
          <li key={row.name}>
            <HoverBooks
              heading={row.name}
              books={row.books}
              hover={hover}
              onOpen={() => drawer.show(row.name, row.books, pageOf(row))}
              page={pageOf(row)}
            >
              <span className='grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 text-left sm:grid-cols-[minmax(0,13rem)_1fr_auto]'>
                <span className='truncate font-serif text-[1.0625rem] underline decoration-accent/60 underline-offset-[3px] transition-colors duration-500 ease-soft group-hover/books:decoration-ink'>
                  {row.name}
                </span>
                <span
                  aria-hidden
                  className='col-span-2 row-start-2 h-2 overflow-hidden rounded-full bg-line/50 sm:col-span-1 sm:col-start-2 sm:row-start-1'
                >
                  <span
                    className='block h-full rounded-full bg-accent'
                    style={{ width: `${(row.books.length / most) * 100}%` }}
                  />
                </span>
                <span className='text-[0.8125rem] tabular-nums text-muted'>
                  {counted(row.books.length, 'book')}
                </span>
              </span>
            </HoverBooks>
          </li>
        ))}
      </ul>
      {!hover && <BooksDrawer {...drawer} />}
    </PagePart>
  );
}
