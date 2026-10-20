import { request } from '@/shared/api/http';
import type { Home, Places } from './types';

export const fetchPlaces = () => request<Places>('/places');

// Saves the whole tree. New places may carry a temporary id; `created` maps
// each of those to the real one it got.
export const savePlaces = (homes: Home[]) =>
  request<Places & { created: Record<string, string> }>('/places', {
    method: 'PUT',
    body: { homes },
  });
