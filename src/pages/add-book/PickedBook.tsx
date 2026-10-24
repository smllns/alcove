import {
  useEditions,
  useWorkDetails,
  useWorkRatings,
} from '@/entities/book/catalogueQueries';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { Spinner } from '@/shared/ui/Spinner';
import { BookForm, draftFromCatalogue } from '@/widgets/book-form';
import { paths } from '@/shared/config/paths';
import { ShelvedByWriter } from './ShelvedByWriter';

type PickedBookProps = {
  work: CatalogueWork;
  // When the search was an ISBN: that exact printing
  isbnEdition?: CatalogueEdition;
  onBack: () => void;
};

// Fetches the editions of the chosen book, what it's about and its genres,
// then opens the form on the best edition: the searched ISBN if there was
// one, else the catalogue's first pick. Above it, what the reader has by
// the same writer already.
export function PickedBook({ work, isbnEdition, onBack }: PickedBookProps) {
  const navigate = useTransitionNavigate();
  const editions = useEditions(work.workKey);
  const about = useWorkDetails(work.workKey);
  // Asked now, so it's there by the time the form shows it
  useWorkRatings(work.workKey);

  if (editions.isPending || about.isPending) {
    return (
      <div className='flex items-center gap-3 py-20 text-sm text-muted'>
        <Spinner /> Finding editions of {work.title}…
      </div>
    );
  }

  // No editions (or the catalogue hiccupped): carry on with what the search gave
  const list = editions.data ?? [];
  const edition = isbnEdition ?? list[0];
  const draft = draftFromCatalogue(work, edition, about.data);
  const withIsbnEdition =
    isbnEdition && !list.some((e) => e.editionKey === isbnEdition.editionKey)
      ? [isbnEdition, ...list]
      : list;

  return (
    <>
      <ShelvedByWriter writer={work.authors[0]} />
      <BookForm
        fields={draft.fields}
        extras={draft.extras}
        editions={withIsbnEdition}
        onSaved={() => navigate(paths.library, 'forward')}
        onBack={onBack}
      />
    </>
  );
}
