import { House, LayoutGrid, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import type { Home } from '@/entities/place/types';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { ChoiceToggle } from '@/shared/ui/ChoiceToggle';
import type { PlacesLook } from './placesLook';
import { HomeTitle } from './HomeTitle';
import { PlacesSearch } from './PlacesSearch';

const looks: { value: PlacesLook; label: string; icon: ReactNode }[] = [
  { value: 'house', label: 'Drawn as houses', icon: <House size={15} /> },
  { value: 'cards', label: 'As cards', icon: <LayoutGrid size={15} /> },
];

// Over the places: the home shown, its name the title, the others to
// switch to from it; a book to look for, the home shown to change, and how
// the places are shown; on a phone, the title over the rest, the search
// and the change of home folded to their icons
export function PlacesToolbar({
  homes,
  home,
  onHome,
  books,
  onFind,
  editing,
  onEdit,
  look,
  onLook,
}: {
  homes: { home: Home; count: number }[];
  // The one shown
  home: string;
  onHome: (id: string) => void;
  books: Book[];
  onFind: (book: Book) => void;
  editing: boolean;
  onEdit: () => void;
  look: PlacesLook;
  onLook: (look: PlacesLook) => void;
}) {
  return (
    <div className='mx-auto mb-8 flex w-full max-w-5xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <HomeTitle homes={homes} home={home} onHome={onHome} />
      <div className='flex shrink-0 items-center gap-2'>
        <PlacesSearch
          books={books}
          homes={homes.map(({ home: each }) => each)}
          onFind={onFind}
        />
        {/* The homes still to be switched between while it's on */}
        <ChoiceToggle
          on={editing}
          onChange={onEdit}
          icon={<Pencil size={14} />}
          label={editing ? 'Editing' : 'Edit'}
          compact
        />
        <ChoiceCapsule
          label='Show the places as'
          options={looks}
          current={look}
          onChange={onLook}
        />
      </div>
    </div>
  );
}
