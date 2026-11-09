import { Plus } from 'lucide-react';
import type { AddBookState, CatalogueWork } from '@/entities/book/types';
import { inCatalogue, isTyped } from '@/entities/book/catalogueBook';
import { paths } from '@/shared/config/paths';
import { ButtonLink } from '@/shared/ui/ButtonLink';

// Under the cover of a book not in the reader's library (its sticker says
// so): the way to add it, the page for adding it with it found (one kept
// in lists as it came, or typed in, filled in as it is there; another
// reader's own, searching for it by its title)
export function AddWork({ work }: { work: CatalogueWork }) {
  return (
    <ButtonLink
      to={paths.addBook}
      state={
        (inCatalogue(work.workKey) || isTyped(work.workKey)
          ? { work }
          : { query: work.title }) satisfies AddBookState
      }
    >
      {/* Turning a quarter as it's pointed at, as the header's Add a book
          does */}
      <Plus
        size={16}
        className='shrink-0 transition-transform duration-700 ease-soft group-hover:rotate-90'
      />
      Add to my library
    </ButtonLink>
  );
}
