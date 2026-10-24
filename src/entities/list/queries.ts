import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createList, fetchLists } from './api';
import type { Lists } from './types';

const listKeys = { all: ['lists'] as const };

// Asked afresh when a list is made, and when a book changes
// (entities/book/queries), which is when how many each holds can change
export const useLists = () =>
  useQuery({
    queryKey: listKeys.all,
    queryFn: fetchLists,
    staleTime: Infinity,
  });

export function useCreateList() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createList,
    onSuccess: ({ lists, counts }) =>
      client.setQueryData<Lists>(listKeys.all, { lists, counts }),
  });
}
