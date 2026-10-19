import { useEffect, useState } from 'react';
import { getCachedCover, loadCover } from '@/entities/book/covers';

// Usually already cached by a preloader; until it arrives the book wears a typographic cover
export function useCoverImage(cover: string) {
  const [image, setImage] = useState(() => getCachedCover(cover));

  useEffect(() => {
    let cancelled = false;
    loadCover(cover).then((loaded) => {
      if (!cancelled && loaded) setImage(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [cover]);

  return image;
}
