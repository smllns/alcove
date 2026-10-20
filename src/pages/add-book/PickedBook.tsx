import { useEditions } from '@/entities/book/queries';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { Spinner } from '@/shared/ui/Spinner';
import { AddBookForm } from './AddBookForm';
import { draftFromCatalogue } from './catalogue';

type PickedBookProps = {
  work: CatalogueWork;
  // When the search was an ISBN: that exact printing
  isbnEdition?: CatalogueEdition;
  onBack: () => void;
};

// Fetches the editions of the chosen book, then opens the form on the best
// one: the searched ISBN if there was one, else the catalogue's first pick.
export function PickedBook({ work, isbnEdition, onBack }: PickedBookProps) {
  const editions = useEditions(work.workKey);

  if (editions.isPending) {
    return (
      <div className='flex items-center gap-3 py-20 text-sm text-muted'>
        <Spinner /> Finding editions of {work.title}…
      </div>
    );
  }

  // No editions (or the catalogue hiccupped): carry on with what the search gave
  const list = editions.data ?? [];
  const edition = isbnEdition ?? list[0];
  const draft = draftFromCatalogue(work, edition);
  const withIsbnEdition =
    isbnEdition && !list.some((e) => e.editionKey === isbnEdition.editionKey)
      ? [isbnEdition, ...list]
      : list;

  return (
    <AddBookForm
      fields={draft.fields}
      extras={draft.extras}
      editions={withIsbnEdition}
      onBack={onBack}
    />
  );
}
