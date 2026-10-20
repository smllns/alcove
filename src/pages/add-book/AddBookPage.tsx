import { useState } from 'react';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { AddBookForm } from './AddBookForm';
import { CatalogueSearch } from './CatalogueSearch';
import { emptyFields } from './draft';
import { PickedBook } from './PickedBook';

type Step =
  | { kind: 'search' }
  | { kind: 'picked'; work: CatalogueWork; isbnEdition?: CatalogueEdition }
  | { kind: 'manual' };

// Find the book in the catalogue (or type it in), check the details, add it
export function AddBookPage() {
  const [step, setStep] = useState<Step>({ kind: 'search' });
  const back = () => setStep({ kind: 'search' });

  return (
    <InnerPage width='lg'>
      <Eyebrow rise={0}>Add a book</Eyebrow>
      <PageTitle rise={80} className='mt-3 sm:mt-4'>
        What’s on your shelf?
      </PageTitle>
      <Lead rise={160} className='mt-4 mb-10 sm:mt-5 sm:mb-12'>
        {step.kind === 'search'
          ? 'Search by title, author or ISBN, and we’ll fill in the rest.'
          : 'Check the details, then tell us about your copy.'}
      </Lead>

      <div className='animate-rise' style={{ animationDelay: '240ms' }}>
        {step.kind === 'search' && (
          <CatalogueSearch
            onPick={(work, isbnEdition) =>
              setStep({ kind: 'picked', work, isbnEdition })
            }
            onManual={() => setStep({ kind: 'manual' })}
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
          <AddBookForm
            fields={emptyFields}
            extras={{}}
            editions={[]}
            onBack={back}
          />
        )}
      </div>
    </InnerPage>
  );
}
