import { useParams } from 'react-router';
import { catalogueBook } from '@/entities/book/catalogueBook';
import { useChangeTyped, useLists } from '@/entities/list/queries';
import { paths } from '@/shared/config/paths';
import { useGoBack } from '@/shared/lib/useGoBack';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { BookForm, draftFromBook } from '@/widgets/book-form';
import { BookFrame } from './BookFrame';

// Changing a book typed into the lists by hand, in the form it was typed
// in with, the book alone; saving or not, back to its page
export function EditWorkPage() {
  const { workKey = '' } = useParams();
  const lists = useLists();
  const change = useChangeTyped();
  const path = paths.work(workKey);
  const back = useGoBack(path);
  const work = lists.data?.lists
    .flatMap((list) => list.works ?? [])
    .find((each) => each.workKey === workKey && each.details);
  return (
    <BookFrame back={path}>
      {work ? (
        <>
          <Eyebrow rise={0}>Edit</Eyebrow>
          <PageTitle
            rise={80}
            className='mt-3 mb-10 text-balance sm:mt-4 sm:mb-12'
          >
            {work.title}
          </PageTitle>
          <div className='animate-rise' style={{ animationDelay: '160ms' }}>
            <BookForm
              key={workKey}
              {...draftFromBook(catalogueBook(work))}
              editions={[]}
              wanted={{
                save: (book) => change.mutateAsync({ key: workKey, book }),
                label: 'Save changes',
              }}
              onSaved={() => void back()}
              onBack={() => void back()}
            />
          </div>
        </>
      ) : lists.isError ? (
        <FormError message={lists.error.message} />
      ) : lists.data ? (
        <PageTitle className='animate-rise'>
          This book isn’t in your lists any more.
        </PageTitle>
      ) : (
        <Loading />
      )}
    </BookFrame>
  );
}
