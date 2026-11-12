import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchNews, publishNews, rewriteNews, unpublishNews } from './api';
import type { NewsInput } from './types';

// alcove's news, as its team sees it to write more
export const useNews = () =>
  useQuery({ queryKey: ['news'], queryFn: fetchNews });

// News written, changed or taken down; everyone's feed shown afresh
export function useNewsChange() {
  const client = useQueryClient();
  const settle = () => {
    void client.invalidateQueries({ queryKey: ['news'] });
    void client.invalidateQueries({ queryKey: ['feed'] });
  };
  return {
    publish: useMutation({ mutationFn: publishNews, onSuccess: settle }),
    rewrite: useMutation({
      mutationFn: ({ id, input }: { id: string; input: NewsInput }) =>
        rewriteNews(id, input),
      onSuccess: settle,
    }),
    unpublish: useMutation({ mutationFn: unpublishNews, onSuccess: settle }),
  };
}
