import { useEffect } from 'react';
import { useInView } from '@/shared/lib/useInView';
import { Spinner } from '@/shared/ui/Spinner';

export type Paging = {
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
};

// Sits after the last book and loads the next page as it comes into view
export function MoreBooks({ hasMore, loadingMore, loadMore }: Paging) {
  const [sentinel, nearEnd] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (nearEnd && hasMore && !loadingMore) loadMore();
  }, [nearEnd, hasMore, loadingMore, loadMore]);

  return (
    <div
      ref={sentinel}
      className='flex h-24 items-center justify-center text-muted'
    >
      {loadingMore && <Spinner />}
    </div>
  );
}
