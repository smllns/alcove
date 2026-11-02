import { useSpineColour } from '@/entities/book/coverTone';
import { spineSize } from '@/entities/book/spine';
import type { Book } from '@/entities/book/types';
import { seedOf } from '@/shared/lib/seed';

// The books in the stats' sections through a building (drawing.tsx): on
// shelves, and stacked up

// A book drawn as a bar in its cover's colour
function ToneRect({
  book,
  ...at
}: {
  book: Book;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const colour = useSpineColour(book, 'var(--spine-pending)');
  return (
    <rect
      {...at}
      rx={Math.min(0.8, at.height / 3)}
      style={{ fill: `color-mix(in oklab, ${colour} 70%, var(--bg-mid))` }}
    />
  );
}

// A bookcase seen from the front, standing on `floor`: its outline and
// shelves in a fine line, the books on each shelf standing in it
export function Bookcase({
  x,
  floor,
  width,
  shelf,
  shelves,
  bare = false,
}: {
  x: number;
  floor: number;
  width: number;
  // How tall a shelf is
  shelf: number;
  shelves: Book[][];
  // Only its shelves, no sides: shelves put up on a wall
  bare?: boolean;
}) {
  const tall = shelves.length * shelf;
  return (
    <g>
      <g stroke='var(--fine)' strokeWidth='0.8' fill='none'>
        {bare ? (
          <line x1={x} x2={x + width} y1={floor} y2={floor} strokeWidth='1.6' />
        ) : (
          <path d={`M${x} ${floor}V${floor - tall}H${x + width}V${floor}`} />
        )}
        {shelves.slice(1).map((_, k) => (
          <line
            key={k}
            x1={x}
            x2={x + width}
            y1={floor - (k + 1) * shelf}
            y2={floor - (k + 1) * shelf}
          />
        ))}
      </g>
      {shelves.map((books, k) => {
        let at = x + 1.5;
        return books.map((book) => {
          const size = spineSize(book);
          const w = Math.max(1.2, (size.width / 100) * shelf * 0.9);
          if (at + w > x + width - 1) return null;
          const h = (size.height / 100) * shelf * 0.8;
          const bar = (
            <ToneRect
              key={book.id}
              book={book}
              x={at}
              y={floor - k * shelf - h - 0.6}
              width={w}
              height={h}
            />
          );
          at += w + 0.4;
          return bar;
        });
      })}
    </g>
  );
}

// The books stacked up from `ground`, a layer to each as thick as the
// pile shares out; broken off (two zigzags across a gap) when `broken`
export function BookStack({
  books,
  x,
  width,
  ground,
  drawn,
  broken,
}: {
  books: Book[];
  x: number;
  width: number;
  ground: number;
  drawn: number;
  broken: boolean;
}) {
  // A pile of hundreds is drawn with a few: each layer a book, as thick
  // as the pile shares out
  const layers = books.slice(0, Math.max(3, Math.round(drawn / 2.6)));
  const each = drawn / layers.length;
  const gap = ground - drawn * 0.62;
  const zigzag = (y: number) =>
    `M${x - 10} ${y}H${x + width * 0.35}L${x + width * 0.45} ${y - 6}L${x + width * 0.55} ${y + 6}L${x + width * 0.65} ${y}H${x + width + 10}`;
  return (
    <g>
      {layers.map((book, i) => {
        const y = ground - (i + 1) * each;
        if (broken && y < gap + 6 && y + each > gap - 6) return null;
        const w = width * (0.74 + seedOf(book.id) * 0.26);
        const lean = Math.sin(i / 9) * 1.8 + seedOf(`${book.id}x`) * 2.6 - 1.3;
        return (
          <ToneRect
            key={book.id}
            book={book}
            x={x + (width - w) / 2 + lean}
            y={y}
            width={w}
            height={Math.max(each - 0.45, 0.5)}
          />
        );
      })}
      {broken && (
        <g fill='none' stroke='var(--fine)' strokeWidth='0.9'>
          <path d={zigzag(gap - 6)} />
          <path d={zigzag(gap + 6)} />
        </g>
      )}
    </g>
  );
}
