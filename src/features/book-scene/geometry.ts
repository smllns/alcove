import type { ShowcaseBook } from '@/entities/book/demo';
import { coverAspect } from './textures/cover';

// Hardcover spines are half an ellipse, squashed by this much
export const SPINE_FLATTEN = 0.45;

// Physical measurements of one book, in scene units
export function bookDimensions(
  book: ShowcaseBook,
  image: HTMLImageElement | null,
) {
  const paperback = book.binding === 'paperback';
  const width = book.width;
  const thickness = book.thickness;
  const height = width * coverAspect(image);
  // Hardcovers have thick boards that overhang the pages; paperbacks are card, flush with them
  const board = paperback ? 0.012 : 0.035;
  const radius = thickness / 2;

  const pages = {
    width: paperback ? width - 0.006 : width - 0.04,
    height: paperback ? height - 0.008 : height - 0.06,
    thickness: thickness - board * 2 - 0.002,
  };

  // Paperback spines are flat; hardcover ones curve round
  const spineWidth = paperback
    ? thickness
    : Math.PI * Math.sqrt((radius ** 2 + (radius * SPINE_FLATTEN) ** 2) / 2);

  return {
    paperback,
    width,
    height,
    thickness,
    board,
    radius,
    pages,
    spineWidth,
  };
}

export type BookDimensions = ReturnType<typeof bookDimensions>;
