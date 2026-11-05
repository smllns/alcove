import { memo, useState, type CSSProperties } from 'react';
import { BookCover } from '@/entities/book/ui/BookCover';
import { useLingering } from '@/shared/lib/useLingering';
import type { SkyStar as Star } from './layout';
import { StarCaption } from './StarCaption';

// How long a caption takes to fade once its book is let go (stars.css)
const CAPTION_FADE_MS = 600;

// One book in the sky, at its place, tilted a little. Hovering brings
// it forward with its title (and rating) underneath. `lit`: found by a
// search; `kin`: by the writer of the book being hovered, so it stays lit
// as the rest of the sky dims. The caption is there only while the book is
// pointed at, and as it fades once let go: under every book at once, the
// captions made each book's layer far larger, for Safari to draw and keep.
export const SkyStar = memo(function SkyStar({
  star,
  lit,
  kin,
}: {
  star: Star;
  lit: boolean;
  kin: boolean;
}) {
  const { book, width } = star;
  const [pointed, setPointed] = useState(false);
  const captioned = useLingering(pointed, CAPTION_FADE_MS);
  const author = book.authors.join(', ');
  return (
    <div
      className='star absolute'
      data-star={book.id}
      data-lit={lit || undefined}
      data-kin={kin || undefined}
      onPointerEnter={() => setPointed(true)}
      onPointerLeave={() => setPointed(false)}
      style={
        {
          left: star.x - width / 2,
          top: star.y - width * 0.75,
          width,
          // For the shapes in stars.css, which are cut to the cover's size
          '--w': `${width}px`,
        } as CSSProperties
      }
    >
      <div
        className='star-shade'
        style={{ '--tilt': `${star.tilt}deg` } as CSSProperties}
      >
        <div className='star-body'>
          <BookCover
            title={book.title}
            author={author}
            url={book.cover?.url}
            bookId={book.id}
            // The same picture as in the grid and the list
            size='L'
            className='star-cover'
          />
        </div>
        {captioned && <StarCaption book={book} author={author} />}
      </div>
    </div>
  );
});
