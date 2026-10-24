import { useState } from 'react';
import { useLocation } from 'react-router';
import type {
  AddBookState,
  CatalogueEdition,
  CatalogueWork,
} from '@/entities/book/types';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { BookForm, emptyFields } from '@/widgets/book-form';
import { CatalogueSearch } from './CatalogueSearch';
import { PickedBook } from './PickedBook';
import { paths } from '@/shared/config/paths';

type Step =
  | { kind: 'search' }
  | { kind: 'picked'; work: CatalogueWork; isbnEdition?: CatalogueEdition }
  | { kind: 'manual' };

// Find the book in the catalogue (or type it in), check the details, add it
export function AddBookPage() {
  const navigate = useTransitionNavigate();
  const found = (useLocation().state as AddBookState | null)?.work;
  const [step, setStep] = useState<Step>(
    found ? { kind: 'picked', work: found } : { kind: 'search' },
  );
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
          <BookForm
            fields={emptyFields}
            extras={{}}
            editions={[]}
            onSaved={() => navigate(paths.library, 'forward')}
            onBack={back}
          />
        )}
      </div>
    </InnerPage>
  );
}
