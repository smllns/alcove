import { useParams } from 'react-router';
import { useSharedList } from '@/entities/list/queries';
import { SaveListButton } from './SaveListButton';
import { WorksListPage } from './WorksListPage';

// Another reader's public list, opened: theirs to change, the reader's to
// look through
export function SharedListPage() {
  const { id = '' } = useParams();
  const list = useSharedList(id);
  return (
    <WorksListPage
      lightKey={id}
      eyebrow={list.data ? `${list.data.owner}’s list` : 'A reader’s list'}
      name={list.data?.name ?? ''}
      works={list.data?.works ?? []}
      error={list.error}
      loading={!list.data}
      actions={
        list.data && (
          <SaveListButton
            kind='shared'
            id={id}
            name={list.data.name}
            books={list.data.works.length}
            works={list.data.works}
          />
        )
      }
    />
  );
}
