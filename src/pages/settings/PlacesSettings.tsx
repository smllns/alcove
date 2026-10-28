import { useState } from 'react';
import type { Home } from '@/entities/place/types';
import { usePlaces } from '@/entities/place/queries';
import { PlacesEditor } from '@/features/places';
import { counted } from '@/shared/lib/plural';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { HouseIcon } from './HouseIcon';

// The places in short, beside a small drawing of a home: how many of
// each, and a way to change them, opening the places themselves under it
export function PlacesSettings() {
  const places = usePlaces();
  if (places.isPending) return <Loading className='justify-start p-6' />;
  if (places.isError)
    return (
      <FormError
        message={`Your places didn’t load. ${places.error.message}`}
        className='p-6'
      />
    );
  return <PlacesInShort {...places.data} />;
}

function PlacesInShort({
  homes,
  counts,
}: {
  homes: Home[];
  counts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const rooms = homes.flatMap((home) => home.rooms);
  const units = rooms.flatMap((room) => room.units);
  const shelves = units.flatMap((unit) => unit.shelves);

  return (
    <>
      <div className='flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-5 sm:px-6'>
        <HouseIcon className='h-16 w-26 shrink-0 text-ink max-sm:hidden' />
        <div className='min-w-0 flex-1'>
          <p className='font-serif text-xl tracking-[-0.01em]'>
            {homes.length
              ? `${counted(homes.length, 'home')} · ${counted(rooms.length, 'room')}`
              : 'No places yet'}
          </p>
          <p className='mt-1 text-sm text-muted'>
            {homes.length
              ? `${counted(units.length, 'bookcase')} · ${counted(shelves.length, 'shelf', 'shelves')}`
              : 'Name your homes, rooms and shelves to put each book in one.'}
          </p>
        </div>
        <Button
          variant='pill'
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className='shrink-0'
        >
          {open ? 'Done' : homes.length ? 'Edit places' : 'Set up places'}
        </Button>
      </div>
      {/* Still there while folded, so nothing changed in it is lost */}
      <Collapse open={open}>
        <div className='border-t border-line/70 px-5 py-6 sm:px-6'>
          <PlacesEditor
            homes={homes}
            counts={counts}
            startBlank={!homes.length}
            submitLabel='Save places'
            quiet
          />
        </div>
      </Collapse>
    </>
  );
}
