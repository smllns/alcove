import { LOOSE, type HomeBooks } from '../arrange';
import { RoomCard } from './RoomCard';

// A home as plain cards rather than drawn: a card for each of its rooms,
// numbered as in the drawing, and one for the books in no room (not
// sorted, in the drawing's attic), each
// opening into the room
export function HomeCards({
  rooms,
  loose,
  onOpen,
}: HomeBooks & { onOpen: (room: string) => void }) {
  if (!rooms.length && !loose.length)
    return (
      <p className='py-16 text-center text-sm text-muted'>No rooms here yet.</p>
    );
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {rooms.map(({ room, ...inside }, i) => (
        <RoomCard
          key={room.id}
          number={i + 1}
          name={room.name}
          {...inside}
          onOpen={() => onOpen(room.id)}
        />
      ))}
      {loose.length > 0 && (
        <RoomCard
          name='Not sorted'
          units={[]}
          loose={loose}
          count={loose.length}
          onOpen={() => onOpen(LOOSE)}
        />
      )}
    </div>
  );
}
