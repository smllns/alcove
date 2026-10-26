import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { Book } from '@/entities/book/types';
import type { Home } from '@/entities/place/types';
import { cn } from '@/shared/lib/cn';
import {
  setPageTransition,
  type PageTransition,
} from '@/shared/lib/pageTransition';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { labelClass } from '@/shared/ui/fieldStyles';
import { arrange } from './arrange';
import { decorOf, furnish } from './decor';
import { HouseView, LOOSE } from './HouseView';
import { RoomView } from './RoomView';
import { BookGrid } from '../views/BookGrid';

// The books where they're kept: a home drawn as a section through it,
// each of its rooms opening into the room itself, its bookcases and the
// books on them.
// Which home and room is in the address (?home, ?room), so coming back
// from a book finds the room as it was left. The books in no place yet
// are shown under it as the grid shows them.
export function PlacesView({ homes, books }: { homes: Home[]; books: Book[] }) {
  const arranged = useMemo(() => arrange(homes, books), [homes, books]);
  const [params, setParams] = useSearchParams();

  const home =
    arranged.homes.find(({ home }) => home.id === params.get('home')) ??
    arranged.homes.find(({ count }) => count > 0) ??
    arranged.homes[0];
  const roomId = params.get('room');
  const inRoom = home.rooms.find(({ room }) => room.id === roomId);
  const room =
    roomId === LOOSE
      ? {
          name: 'By the door',
          units: [],
          loose: home.loose,
          count: home.loose.length,
        }
      : inRoom && { name: inRoom.room.name, ...inRoom };

  const show = (
    next: { home: string; room?: string },
    kind: PageTransition = next.room ? 'room' : 'room-back',
  ) => {
    setPageTransition(kind);
    setParams(next.room ? next : { home: next.home }, {
      replace: true,
      viewTransition: true,
    });
  };
  const open = (id: string) => show({ home: home.home.id, room: id });

  if (room)
    return (
      <RoomView
        {...room}
        // Furnished as it is in the plan of the home
        decor={
          furnish(home.rooms.map(({ room }) => room.id)).get(roomId!) ??
          decorOf(LOOSE)
        }
        home={home.home.name}
        onBack={() => show({ home: home.home.id })}
      />
    );

  return (
    <div className='flex flex-col'>
      {arranged.homes.length > 1 && (
        <div className='mb-8 flex flex-wrap justify-center gap-2'>
          {arranged.homes.map(({ home: each }) => (
            <button
              key={each.id}
              type='button'
              aria-pressed={each.id === home.home.id}
              onClick={() => show({ home: each.id }, 'home')}
              className={choiceClass(each.id === home.home.id)}
            >
              {each.name}
            </button>
          ))}
        </div>
      )}
      <div className='mx-auto w-full max-w-5xl'>
        <HouseView {...home} onOpen={open} />
      </div>

      {arranged.unplaced.length > 0 && (
        <section className='mx-auto mt-16 w-full max-w-5xl'>
          <p className={cn('mb-4', labelClass)}>
            Not placed yet · {arranged.unplaced.length}
          </p>
          {/* As the grid shows them, each opening its page */}
          <BookGrid
            books={arranged.unplaced}
            size='S'
            hasMore={false}
            loadingMore={false}
            loadMore={() => {}}
          />
        </section>
      )}
    </div>
  );
}
