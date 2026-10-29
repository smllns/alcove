import { paths } from '@/shared/config/paths';
import type { ListOpenState, SavedList } from './types';

// Where a list made on Open Library opens, and what its page is opened
// with: its name and size, which its page can't always ask for
export const readersListOpening = (
  owner: string,
  id: string,
  state: ListOpenState,
) => ({ to: paths.readersList(owner, id), state });

// Where a list kept from another reader opens, and what with
export function savedOpening(list: SavedList): {
  to: string;
  state?: ListOpenState;
} {
  if (list.kind === 'shared') return { to: paths.sharedList(list.ref) };
  const [owner, id] = list.ref.split('/');
  return readersListOpening(owner, id, { name: list.name, books: list.books });
}

// Whether `list` is the one kept as `kind` `ref`
export const isSaved = (
  list: Pick<SavedList, 'kind' | 'ref'>,
  kind: SavedList['kind'],
  ref: string,
) => list.kind === kind && list.ref === ref;
