import { createContext, useContext, useState } from 'react';

// Books in a room picked out, to move elsewhere together: on once
// arranging is (the room's Arrange, or a book held on), each book then
// picked or let go by a tap rather than opened. On from the first, if
// `initial`.
export function useArranging(initial = false) {
  const [on, setOn] = useState(initial);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const set = (change: (ids: Set<string>) => void) =>
    setPicked((now) => {
      const next = new Set(now);
      change(next);
      return next;
    });
  return {
    on,
    picked,
    toggle: (id: string) =>
      set((ids) => (ids.has(id) ? ids.delete(id) : ids.add(id))),
    // Held on: arranging, with that book picked
    start: (id: string) => {
      setOn(true);
      set((ids) => ids.add(id));
    },
    clear: () => setPicked(new Set()),
    // Arranging, or done with it
    turn: (next: boolean) => {
      setOn(next);
      setPicked(new Set());
    },
  };
}

export type Arranging = ReturnType<typeof useArranging>;

// For the books on the shelves, however far down, to be picked
export const ArrangingContext = createContext<Arranging | null>(null);
export const useArrangingHere = () => useContext(ArrangingContext);
