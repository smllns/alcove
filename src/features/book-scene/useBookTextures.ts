import { useEffect, useMemo } from 'react';
import type { Book } from '@/entities/book/types';
import type { BookDimensions } from './geometry';
import { seededRandom } from './textures/canvas';
import { createBackCover, createFrontCover } from './textures/cover';
import { createPageEdgeTexture } from './textures/pages';
import { createSpineTexture } from './textures/spine';
import { createSurfaceMap } from './textures/wear';

// Every printed and paper surface of one book, disposed when it changes
export function useBookTextures(
  book: Book,
  image: HTMLImageElement | null,
  size: BookDimensions,
) {
  const { paperback, spineWidth, height } = size;

  const textures = useMemo(() => {
    const binding = { paperback };
    const rand = seededRandom(book.title);

    return {
      front: createFrontCover(book, image, rand, binding),
      back: createBackCover(book, image, rand, binding),
      spine: createSpineTexture(book, spineWidth / height, rand, binding),
      // Dust jackets keep a satin sheen; paperback card is closer to matte
      surface: createSurfaceMap(rand, paperback ? 0.62 : 0.4, book.wear),
      foreEdge: createPageEdgeTexture(rand, 'u', 0, book.wear),
      topEdge: createPageEdgeTexture(
        rand,
        'v',
        0.35 + book.wear * 0.25,
        book.wear,
      ),
      bottomEdge: createPageEdgeTexture(rand, 'v', 0.1, book.wear),
    };
  }, [book, image, paperback, spineWidth, height]);

  useEffect(
    () => () => Object.values(textures).forEach((tex) => tex.dispose()),
    [textures],
  );

  return textures;
}

export type BookTextures = ReturnType<typeof useBookTextures>;
