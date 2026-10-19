import * as THREE from 'three';
import type { ShowcaseBook } from '@/entities/book/types';

type Viewport = { width: number; height: number; aspect: number };

// Narrow landscape screens squeeze the desktop layout; portrait screens switch
// to a smaller set of books parked above and below the text.
export function layoutBooks(books: ShowcaseBook[], viewport: Viewport) {
  const portrait = viewport.aspect < 0.8;
  const fit = THREE.MathUtils.clamp(viewport.width / 11, 0.4, 1);
  const scale = portrait
    ? THREE.MathUtils.clamp(viewport.width / 5, 0.5, 0.85)
    : Math.max(0.6, fit);

  const placed = books.flatMap((book, index) => {
    if (!portrait) {
      const [x, y, z] = book.position;
      return [
        { book, index, position: [x * fit, y, z] as [number, number, number] },
      ];
    }
    if (!book.mobile) return [];
    const [nx, ny, z] = book.mobile;
    const position: [number, number, number] = [
      (nx * viewport.width) / 2 / scale,
      (ny * viewport.height) / 2 / scale,
      z,
    ];
    return [{ book, index, position }];
  });

  return { placed, scale };
}
