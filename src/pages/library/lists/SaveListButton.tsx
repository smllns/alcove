import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { CatalogueWork } from '@/entities/book/types';
import { isSaved } from '@/entities/list/opening';
import { useKeepList, useSavedLists } from '@/entities/list/queries';
import type { SavedList } from '@/entities/list/types';
import { ChoiceToggle } from '@/shared/ui/ChoiceToggle';

// How many of a list's books are kept with it, for its pile
const PILE = 16;

// Another reader's list kept to come back to, under the reader's own on
// the lists' page, or let go again: lit while it's kept
export function SaveListButton({
  kind,
  id,
  name,
  books,
  works,
}: Omit<SavedList, 'ref' | 'works' | 'savedAt'> & {
  // Its id, as SavedList's `ref`
  id: string;
  works: CatalogueWork[];
}) {
  const saved = useSavedLists().data ?? [];
  const keep = useKeepList();
  const kept = saved.some((each) => isSaved(each, kind, id));
  return (
    <ChoiceToggle
      on={kept}
      onChange={(on) =>
        keep.mutate({
          keep: on,
          list: {
            kind,
            ref: id,
            name,
            books,
            works: works.slice(0, PILE),
          },
        })
      }
      icon={kept ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      label={kept ? 'Saved' : 'Save'}
    />
  );
}
