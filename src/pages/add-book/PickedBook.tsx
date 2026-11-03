import {
  useEditions,
  useWorkDetails,
  useWorkRatings,
} from '@/entities/book/catalogueQueries';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { useOwnedWork } from '@/entities/book/queries';
import { Spinner } from '@/shared/ui/Spinner';
import { BookForm, draftFromCatalogue } from '@/widgets/book-form';
import { paths } from '@/shared/config/paths';
import { AlreadyShelved } from './AlreadyShelved';
import { ShelvedByWriter } from './ShelvedByWriter';

type PickedBookProps = {
  work: CatalogueWork;
  // When the search was an ISBN: that exact printing
  isbnEdition?: CatalogueEdition;
  onBack: () => void;
};

// Fetches the editions of the chosen book, what it's about and its genres,
// then opens the form on the best edition: the searched ISBN if there was
// one, else the catalogue's first pick. Above it, the reader's copy, if
// they have this book already (and the form adds a second without asking
// again); otherwise what they have by the same writer.
export function PickedBook({ work, isbnEdition, onBack }: PickedBookProps) {
  const navigate = useTransitionNavigate();
  const editions = useEditions(work.workKey);
  const about = useWorkDetails(work.workKey);
  const owned = useOwnedWork(work.workKey);
  // Asked now, so it's there by the time the form shows it
  useWorkRatings(work.workKey);

  if (editions.isPending || about.isPending || owned.isPending) {
    return (
      <div className='flex items-center gap-3 py-20 text-sm text-muted'>
        <Spinner /> Finding editions of {work.title}…
      </div>
    );
  }

  // No editions (or the catalogue hiccupped): carry on with what the search
  // gave
  const list = editions.data ?? [];
  const edition = isbnEdition ?? list[0];
  const draft = draftFromCatalogue(work, edition, about.data);
  const withIsbnEdition =
    isbnEdition && !list.some((e) => e.editionKey === isbnEdition.editionKey)
      ? [isbnEdition, ...list]
      : list;

  return (
    <>
      {owned.data ? (
        <AlreadyShelved bookId={owned.data} chosen={{ work, isbnEdition }} />
      ) : (
        <ShelvedByWriter writer={work.authors[0]} />
      )}
      <BookForm
        secondCopy={Boolean(owned.data)}
        fields={draft.fields}
        extras={draft.extras}
        editions={withIsbnEdition}
        onSaved={() => navigate(paths.library, 'forward')}
        onBack={onBack}
      />
    </>
  );
}
