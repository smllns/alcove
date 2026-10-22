import { useEditions } from '@/entities/book/catalogueQueries';
import { useGoBack } from '@/shared/lib/useGoBack';
import { Loading } from '@/shared/ui/Loading';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { BookForm, draftFromBook } from '@/widgets/book-form';
import { BookFrame } from './BookFrame';
import { BookMissing } from './BookMissing';
import { useBookPage } from './useBookPage';

// Changing anything about a book on the shelves, in the form it was added
// with. Saving or not, it's back to the book's page as it was left.
export function EditBookPage() {
  const { book: query, path } = useBookPage();
  const book = query.data;
  const backToBook = useGoBack(path);
  // Other editions to switch to, and their covers, once they've come
  const editions = useEditions(book?.openLibrary?.work);
  return (
    <BookFrame back={path}>
      {book ? (
        <>
          <Eyebrow rise={0}>Edit</Eyebrow>
          <PageTitle
            rise={80}
            className='mt-3 mb-10 text-balance sm:mt-4 sm:mb-12'
          >
            {book.title}
          </PageTitle>
          <div className='animate-rise' style={{ animationDelay: '160ms' }}>
            <BookForm
              key={book.id}
              {...draftFromBook(book)}
              editions={editions.data ?? []}
              editing={book}
              onSaved={() => void backToBook()}
              onBack={() => void backToBook()}
            />
          </div>
        </>
      ) : query.isError ? (
        <BookMissing error={query.error} />
      ) : (
        <Loading />
      )}
    </BookFrame>
  );
}
