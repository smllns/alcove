import { Plus } from 'lucide-react';
import type { AddBookState, CatalogueWork } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { ButtonLink } from '@/shared/ui/ButtonLink';

// Under the cover of a book not on the reader's shelves (its sticker says
// so): the way to add it, the page for adding it with it found
export function AddWork({ work }: { work: CatalogueWork }) {
  return (
    <ButtonLink to={paths.addBook} state={{ work } satisfies AddBookState}>
      <Plus size={16} />
      Add to my library
    </ButtonLink>
  );
}
