import { useState } from 'react';
import { useImportBooks } from '@/entities/book/importQueries';
import { useImportWanted } from '@/entities/list/queries';
import {
  countBrought,
  newImportId,
  readExport,
  toBring,
  toWant,
  type Imported,
  type Source,
} from '@/features/import-books';
import { FormError } from '@/shared/ui/FormError';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { ChooseExport } from './ChooseExport';
import { ImportDone, type Brought } from './ImportDone';
import { ImportPreview } from './ImportPreview';
import { ImportProgress } from './ImportProgress';

type Found = { source: Source; books: Imported[] };
// How far it's got: the books into the library, then those wanted
type Going = { wanted: boolean; done: number; of: number };

// Bringing a library over from Goodreads or StoryGraph: the file chosen,
// what's in it shown before anything's added, then the books coming over
// batch by batch (into the library, then those wanted into Want to read),
// each looked up in the catalogue by its ISBN, how far it's got shown,
// and what came of it.
export function ImportPage() {
  const [found, setFound] = useState<Found | null>(null);
  const [problem, setProblem] = useState<string>();
  // Whether the books only wanted go into Want to read
  const [wanted, setWanted] = useState(true);
  const [going, setGoing] = useState<Going | null>(null);
  const [brought, setBrought] = useState<Brought | null>(null);
  const [failed, setFailed] = useState<string>();
  // This import's own id, for its books to be undone by
  const [importId, setImportId] = useState(newImportId);
  const importBooks = useImportBooks();
  const importWanted = useImportWanted();

  const read = (text: string) => {
    const result = readExport(text);
    if (!result)
      return setProblem(
        'This doesn’t look like an export from Goodreads or StoryGraph.',
      );
    if (!result.books.length)
      return setProblem('There are no books in this file.');
    setProblem(undefined);
    setFound(result);
  };

  // How far one part has got, told as it goes
  const track = (wanted: boolean, of: number) => (done: number) =>
    setGoing({ wanted, done, of });

  const bring = async (all: Imported[]) => {
    const books = toBring(all);
    const want = wanted ? toWant(all) : [];
    const done: Brought = {};
    setFailed(undefined);
    try {
      if (books.length) {
        const onBatch = track(false, books.length);
        onBatch(0);
        done.books = await importBooks.mutateAsync({
          books,
          importId,
          onBatch,
        });
      }
      if (want.length) {
        const onBatch = track(true, want.length);
        onBatch(0);
        done.wanted = await importWanted.mutateAsync({
          books: want,
          importId,
          onBatch,
        });
      }
      setBrought(done);
    } catch (error) {
      setFailed(
        `It stopped partway: ${(error as Error).message} What came over is in your library. Bring the file again for the rest.`,
      );
    } finally {
      setGoing(null);
    }
  };

  return (
    <InnerPage width='lg'>
      <Eyebrow rise={0}>Bring your books</Eyebrow>
      <PageTitle rise={80} className='mt-3 sm:mt-4'>
        Move your library
      </PageTitle>
      <Lead rise={160} className='mt-4 mb-10 sm:mt-5 sm:mb-12'>
        Everything you’ve shelved on Goodreads or StoryGraph: what you’ve read
        and when, your stars and your reviews, and what you want to read.
      </Lead>
      <div className='animate-rise' style={{ animationDelay: '240ms' }}>
        {brought ? (
          <ImportDone
            brought={brought}
            importId={importId}
            onUndone={() => {
              // Back to the start, a fresh import to come
              setBrought(null);
              setFound(null);
              setImportId(newImportId());
            }}
          />
        ) : going ? (
          <ImportProgress {...going} />
        ) : found ? (
          <>
            <ImportPreview
              source={found.source}
              counts={countBrought(found.books)}
              wanted={wanted}
              onWanted={setWanted}
              onBring={() => void bring(found.books)}
              onBack={() => {
                setFailed(undefined);
                setFound(null);
              }}
            />
            <FormError message={failed ?? null} className='mt-6' />
          </>
        ) : (
          <ChooseExport onText={read} error={problem} />
        )}
      </div>
    </InnerPage>
  );
}
