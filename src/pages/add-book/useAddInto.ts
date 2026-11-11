import { useState } from 'react';
import type { CatalogueWork } from '@/entities/book/types';
import { WANT_LIST } from '@/entities/list/names';
import {
  useChangeListWorks,
  useLists,
  usePutTyped,
} from '@/entities/list/queries';
import { paths } from '@/shared/config/paths';
import { useGoBack } from '@/shared/lib/useGoBack';
import type { WantedSave } from '@/widgets/book-form';

// Where a book being added goes: into the library, or (`only`) only into a
// list, Want to read unless it was come to from another (`into`): one from
// the catalogue straight in, one typed in with all that's known of it.
// Either way, back to where the reader was before they came to add it (the
// library, if nowhere).
export function useAddInto(into?: string) {
  const list = into ?? WANT_LIST;
  const [only, setOnly] = useState(Boolean(into));
  const name =
    useLists().data?.lists.find((each) => each.id === list)?.name ??
    'Want to read';
  const put = usePutTyped();
  const works = useChangeListWorks();
  const done = useGoBack(paths.library);
  const wanted: WantedSave | undefined = only
    ? {
        save: (book) => put.mutateAsync({ id: list, book }),
        label: `Add to ${name}`,
      }
    : undefined;
  const keepWork = (work: CatalogueWork) => {
    works.mutate({ id: list, add: [work] });
    void done();
  };
  return { name, only, setOnly, wanted, keepWork, done };
}
