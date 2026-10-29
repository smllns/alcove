import { useLocation, useParams } from 'react-router';
import { useReadersList } from '@/entities/book/catalogueListQueries';
import type { ListOpenState } from '@/entities/list/types';
import { SaveListButton } from './SaveListButton';
import { WorksListPage } from './WorksListPage';

// A list a reader made on Open Library, opened: its books a few dozen at
// a time, the next only as they're asked for
export function ReadersListPage() {
  const { owner = '', id = '' } = useParams();
  const known = useLocation().state as ListOpenState | null;
  const list = useReadersList(owner, id);
  const pages = list.data?.pages ?? [];
  const works = pages.flatMap((page) => page.works);
  const name = known?.name ?? 'A list on Open Library';
  const total = Math.max(pages[0]?.books ?? known?.books ?? 0, works.length);
  return (
    <WorksListPage
      lightKey={`${owner}/${id}`}
      eyebrow='A reader’s list on Open Library'
      name={name}
      works={works}
      total={total}
      more={
        list.hasNextPage
          ? {
              onMore: () => void list.fetchNextPage(),
              loading: list.isFetchingNextPage,
            }
          : undefined
      }
      error={list.error}
      loading={!pages.length}
      actions={
        pages.length > 0 && (
          <SaveListButton
            kind='readers'
            id={`${owner}/${id}`}
            name={name}
            books={total}
            works={works}
          />
        )
      }
    />
  );
}
