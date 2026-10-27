import { useState } from 'react';
import { easeChange } from '@/shared/lib/easeChange';
import { readStored, store } from '@/shared/lib/storage';

// The ways to look at the places: each home drawn as a house, or its rooms
// as plain cards
export type PlacesLook = 'house' | 'cards';

const KEY = 'alcove.places-view';

// The chosen one, remembered in this browser; another chosen comes in over
// the one before
export function usePlacesLook() {
  const [view, setView] = useState<PlacesLook>(() =>
    readStored(KEY) === 'cards' ? 'cards' : 'house',
  );
  const choose = (next: PlacesLook) => {
    if (next === view) return;
    store(KEY, next);
    easeChange(() => setView(next), 'swap');
  };
  return [view, choose] as const;
}
