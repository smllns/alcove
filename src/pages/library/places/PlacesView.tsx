import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Book } from '@/entities/book/types';
import type { Home } from '@/entities/place/types';
import { paths } from '@/shared/config/paths';
import { easeChange } from '@/shared/lib/easeChange';
import { scrollPageTo } from '@/shared/lib/pageScroll';
import { useGoBack } from '@/shared/lib/useGoBack';
import { setPageTransition } from '@/shared/lib/pageTransition';
import { LOOSE, arrange } from './arrange';
import { atticOf, furnish } from './drawing/decor';
import { HomeCards } from './cards/HomeCards';
import { HomeEditor } from './HomeEditor';
import { HouseView } from './house/HouseView';
import { usePlacesLook } from './placesLook';
import { PlacesToolbar } from './PlacesToolbar';
import { RoomView } from './room/RoomView';
import { UnplacedShelf } from './shelf/UnplacedShelf';

// The books where they're kept: a home drawn as a section through it, or
// its rooms as plain cards (the reader's choice, placesLook), each room
// opening into the room itself, its bookcases and the books on them.
// Which home and room is in the address (?home, ?room), so coming back
// from a book finds the room as it was left. The books in no place yet
// are shown under it as the grid shows them.
export function PlacesView({ homes, books }: { homes: Home[]; books: Book[] }) {
  const arranged = useMemo(() => arrange(homes, books), [homes, books]);
  const [look, chooseLook] = usePlacesLook();
  // The home shown being changed, in place of its drawing or cards
  const [editing, setEditing] = useState(false);
  const swap = (change: () => void) => easeChange(change, 'swap');
  const [params, setParams] = useSearchParams();

  const home =
    arranged.homes.find(({ home }) => home.id === params.get('home')) ??
    arranged.homes.find(({ count }) => count > 0) ??
    arranged.homes[0];
  const roomId = params.get('room');
  // Opened from a book's page to find it there, the way back leads to it
  const found = books.find((book) => book.id === params.get('book'));
  const backToBook = useGoBack(found ? paths.book(found.id) : paths.places);
  const inRoom = home.rooms.find(({ room }) => room.id === roomId);
  const room =
    roomId === LOOSE
      ? {
          name: 'Not sorted',
          units: [],
          loose: home.loose,
          count: home.loose.length,
        }
      : inRoom && { name: inRoom.room.name, ...inRoom };

  // Another home or room in place of the one shown, the one fading into
  // the other where it stands
  const show = (next: { home: string; room?: string; find?: string }) => {
    setPageTransition('swap');
    setParams(
      Object.fromEntries(
        Object.entries(next).filter(([, value]) => value),
      ) as Record<string, string>,
      { replace: true, viewTransition: true },
    );
  };
  const open = (id: string) => show({ home: home.home.id, room: id });
  // A book looked for, found where it is: in its room, a home's attic, or
  // among the books not placed yet
  const find = (book: Book) => {
    const place = book.copy?.place;
    const at = arranged.homes.find((each) => each.home.id === place?.home);
    const room = at?.rooms.find((each) => each.room.id === place?.room);
    show({
      home: at?.home.id ?? home.home.id,
      room: at && (room ? room.room.id : LOOSE),
      find: book.id,
    });
  };
  // Another home or room shown starts at its top, there already as it
  // comes in; not the one first shown (come back to from a book, say,
  // where it was left)
  const shownNow = `${home.home.id}/${roomId ?? ''}`;
  const shownFirst = useRef(shownNow);
  useLayoutEffect(() => {
    if (shownNow === shownFirst.current) return;
    shownFirst.current = '';
    scrollPageTo(0);
  }, [shownNow]);

  const roomIds = home.rooms.map(({ room }) => room.id);
  if (room)
    return (
      <RoomView
        {...room}
        // Furnished as it is in the plan of the home
        decor={
          roomId === LOOSE
            ? atticOf(home.home.id, roomIds)
            : furnish(roomIds).get(roomId!)!
        }
        drawn={look === 'house'}
        found={found?.id ?? params.get('find') ?? undefined}
        // Opened to find a book, back to it, the way the reader came;
        // otherwise out to the home
        backTo={found ? found.title : home.home.name}
        onBack={found ? backToBook : () => show({ home: home.home.id })}
      />
    );

  return (
    <div className='flex flex-col'>
      <PlacesToolbar
        homes={arranged.homes}
        home={home.home.id}
        onHome={(id) => show({ home: id })}
        books={books}
        onFind={find}
        editing={editing}
        onEdit={() => swap(() => setEditing(!editing))}
        look={look}
        onLook={chooseLook}
      />
      <div className='mx-auto w-full max-w-5xl'>
        {editing ? (
          <HomeEditor
            home={home.home.id}
            onDone={() => swap(() => setEditing(false))}
          />
        ) : look === 'house' ? (
          <HouseView {...home} onOpen={open} />
        ) : (
          <HomeCards {...home} onOpen={open} />
        )}
      </div>

      {/* Not while a home is being changed */}
      {!editing && arranged.unplaced.length > 0 && (
        <UnplacedShelf
          books={arranged.unplaced}
          found={roomId ? undefined : (params.get('find') ?? undefined)}
          className='mx-auto mt-16 w-full max-w-5xl'
        />
      )}
    </div>
  );
}
