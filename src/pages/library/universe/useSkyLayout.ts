import { useMemo } from 'react';
import type { Book } from '@/entities/book/types';
import { useWritersKnown } from '@/entities/book/writers';
import { layoutSky } from './layout';

// The books laid out in the sky (layoutSky), and their writers' books
// joined anew whenever alcove learns two names are one writer's
export function useSkyLayout(books: Book[]) {
  const writersKnown = useWritersKnown();
  return useMemo(
    () => layoutSky(books),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [books, writersKnown],
  );
}
