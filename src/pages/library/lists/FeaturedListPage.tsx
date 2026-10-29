import { useParams } from 'react-router';
import { useFeaturedList } from '@/entities/book/catalogueListQueries';
import { WorksListPage } from './WorksListPage';

// One of the lists every reader sees, opened
export function FeaturedListPage() {
  const { id = '' } = useParams();
  const list = useFeaturedList(id);
  return (
    <WorksListPage
      lightKey={id}
      eyebrow='From Open Library'
      name={list.data?.name ?? ''}
      works={list.data?.works ?? []}
      error={list.error}
      loading={!list.data}
    />
  );
}
