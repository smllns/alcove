import { cn } from '@/shared/lib/cn';
import type { RoomBooks } from '../arrange';
import { detailOf, tagOf } from './bookcaseTags';
import { RoomDetail } from './RoomDetail';

// Each bookcase of a room opened, large, with the books face out on its
// shelves, and any books kept in the room but in no bookcase. `tagged`:
// lettered as in the room's drawing above them.
export function RoomDetails({
  units,
  loose,
  tagged,
  className,
}: Pick<RoomBooks, 'units' | 'loose'> & {
  tagged: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative grid gap-x-16 gap-y-14',
        className,
        // Side by side on a wide screen, unless there's only the one
        units.length + (loose.length ? 1 : 0) > 1 && 'lg:grid-cols-2',
      )}
    >
      {units.map(({ unit, shelves, loose: lying, count: held }, i) => (
        <RoomDetail
          key={unit.id}
          id={detailOf(unit.id)}
          tag={tagged ? tagOf(i) : undefined}
          name={unit.name}
          count={held}
          shelves={[
            ...(lying.length
              ? [{ key: 'loose', name: 'Not on a shelf', books: lying }]
              : []),
            ...shelves.map(({ shelf, books }) => ({
              key: shelf.id,
              name: shelf.name,
              books,
            })),
          ]}
        />
      ))}
      {loose.length > 0 && (
        <RoomDetail
          id={detailOf('loose')}
          name={units.length ? 'Elsewhere in the room' : 'In the room'}
          count={loose.length}
          shelves={[{ key: 'loose', name: 'Not on a shelf', books: loose }]}
        />
      )}
      {!units.length && !loose.length && (
        <p className='text-sm text-muted'>Nothing kept here yet.</p>
      )}
    </div>
  );
}
