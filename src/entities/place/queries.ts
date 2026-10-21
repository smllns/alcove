import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPlaces, savePlaces } from './api';
import type { Places } from './types';

const placeKeys = { all: ['places'] as const };

export const usePlaces = () =>
  useQuery({ queryKey: placeKeys.all, queryFn: fetchPlaces });

export function useSavePlaces() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: savePlaces,
    onSuccess: ({ homes, counts }) => {
      client.setQueryData<Places>(placeKeys.all, { homes, counts });
      // Removing a place can move books out of it
      void client.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
