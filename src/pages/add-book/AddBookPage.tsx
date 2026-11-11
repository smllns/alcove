import { useState } from 'react';
import { useLocation } from 'react-router';
import type {
  AddBookState,
  CatalogueEdition,
  CatalogueWork,
} from '@/entities/book/types';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import {
  catalogueBook,
  isReadersOwn,
  isTyped,
} from '@/entities/book/catalogueBook';
import {
  BookForm,
  draftFromBook,
  draftFromOurs,
  emptyFields,
} from '@/widgets/book-form';
import { AddIntoChoice } from './AddIntoChoice';
import { CatalogueSearch } from './CatalogueSearch';
import { PickedBook } from './PickedBook';
import { useAddInto } from './useAddInto';

type Step =
  | { kind: 'search' }
  | { kind: 'picked'; work: CatalogueWork; isbnEdition?: CatalogueEdition }
  | {
      kind: 'manual';
      isbn?: string;
      // Begun from a printing alcove knows, from a book typed into lists
      // by hand (`typed`, its key there), now on the shelves, or from
      // another reader's own, all that's known of it filled in
      draft?: ReturnType<typeof draftFromOurs>;
      typed?: string;
    };

// Where it starts: on the book it was come to with, if any
function startOf({ work, isbnEdition, byHand }: AddBookState): Step {
  if (byHand !== undefined)
    return {
      kind: 'manual',
      draft: { fields: { ...emptyFields, title: byHand }, extras: {} },
    };
  if (!work) return { kind: 'search' };
  if (isTyped(work.workKey) || isReadersOwn(work.workKey))
    return {
      kind: 'manual',
      draft: draftFromBook(catalogueBook(work)),
      typed: isTyped(work.workKey) ? work.workKey : undefined,
    };
  return { kind: 'picked', work, isbnEdition };
}

// Find the book in the catalogue (or type it in), check the details, add
// it: to the library, or only to Want to read (or the list it was come to
// from), not having it yet (useAddInto)
export function AddBookPage() {
  const found = useLocation().state as AddBookState | null;
  const [step, setStep] = useState<Step>(() => startOf(found ?? {}));
  const back = () => setStep({ kind: 'search' });
  const into = useAddInto(found?.into);
  // Another reader's own (found among theirs): its form, all that's known
  // of it filled in, for the library or a list alike
  const pick = (work: CatalogueWork, isbnEdition?: CatalogueEdition) =>
    isReadersOwn(work.workKey)
      ? setStep(startOf({ work }))
      : into.only
        ? into.keepWork(work)
        : setStep({ kind: 'picked', work, isbnEdition });

  return (
    <InnerPage width='lg' fit={step.kind === 'search'}>
      <Eyebrow rise={0}>Add a book</Eyebrow>
      <PageTitle rise={80} className='mt-3 sm:mt-4'>
        {into.only ? 'What do you want to read?' : 'What’s on your shelf?'}
      </PageTitle>
      <Lead rise={160} className='mt-4 mb-10 sm:mt-5 sm:mb-12'>
        {step.kind === 'search'
          ? 'Search by title, author or ISBN, and we’ll fill in the rest.'
          : into.only
            ? 'Fill in all you know about it.'
            : 'Check the details, then tell us about your copy.'}
      </Lead>

      <div
        className='flex flex-1 animate-rise flex-col'
        style={{ animationDelay: '240ms' }}
      >
        {(step.kind === 'search' ||
          (step.kind === 'manual' && !step.typed)) && (
          <AddIntoChoice
            list={into.name}
            only={into.only}
            onChange={into.setOnly}
          />
        )}
        {step.kind === 'search' && (
          <CatalogueSearch
            onPick={pick}
            onManual={(isbn) => setStep({ kind: 'manual', isbn })}
            onOurs={(edition) =>
              setStep({ kind: 'manual', draft: draftFromOurs(edition) })
            }
            initialQuery={found?.query}
          />
        )}
        {step.kind === 'picked' && (
          <PickedBook
            key={step.work.workKey}
            work={step.work}
            isbnEdition={step.isbnEdition}
            onBack={back}
          />
        )}
        {step.kind === 'manual' && (
          <BookForm
            fields={
              step.draft?.fields ?? { ...emptyFields, isbn: step.isbn ?? '' }
            }
            extras={step.draft?.extras ?? {}}
            editions={[]}
            typed={step.typed}
            wanted={into.wanted}
            onSaved={() => void into.done()}
            onBack={back}
          />
        )}
      </div>
    </InnerPage>
  );
}
