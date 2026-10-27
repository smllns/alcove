import {
  CircleDashed,
  DoorOpen,
  House,
  Inbox,
  LibraryBig,
  Rows3,
  type LucideIcon,
} from 'lucide-react';
import { useState, type RefObject } from 'react';
import { usePlaces } from '@/entities/place/queries';
import { cn } from '@/shared/lib/cn';
import { Popover } from '@/shared/ui/Popover';
import { PopoverSearch } from '@/shared/ui/PopoverSearch';
import { nowhere, targetsOf, type Target } from './moveTargets';

// Where to move the books picked: out of every place (back among the
// books not placed yet), or any place in any home, as the tree it's in,
// each level its own look (a room by its door, its bookcases under it,
// their shelves under those), to narrow down by name, one tap putting
// them there, in a room, a bookcase or on a shelf. `here`: the place
// they're all in already, not offered.
export function MovePicker({
  open,
  anchor,
  title,
  here,
  onClose,
  onPick,
}: {
  open: boolean;
  anchor: RefObject<HTMLElement | null>;
  title: string;
  here?: string;
  onClose: () => void;
  onPick: (target: Target) => void;
}) {
  const homes = usePlaces().data?.homes ?? [];
  const [query, setQuery] = useState('');
  const asked = query.trim().toLowerCase();
  const groups = targetsOf(homes, asked);
  // One place to put them
  const row = (place: Target, icon: LucideIcon, className?: string) => {
    const Icon = icon;
    const now = place.key === here;
    return (
      <button
        key={place.key}
        type='button'
        disabled={now}
        onClick={() => onPick(place)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 rounded-lg py-2 pr-2 text-left text-sm text-ink transition-colors duration-300 ease-soft hover:bg-ink/6 disabled:cursor-default disabled:text-faint disabled:hover:bg-transparent',
          className,
        )}
      >
        <Icon size={14} className='shrink-0 text-muted' />
        <span className='min-w-0 flex-1 truncate'>{place.name}</span>
        {now && <span className='text-xs text-faint'>here now</span>}
      </button>
    );
  };

  return (
    <Popover open={open} anchor={anchor} onClose={onClose} width={360}>
      <div className='flex shrink-0 flex-col gap-3 border-b border-line/60 px-4 pb-3 pt-4'>
        <p className='font-serif text-lg text-ink'>{title}</p>
        <PopoverSearch
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Find a place'
          aria-label='Find a place'
        />
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3'>
        {/* Out of every home, back among the books with no place yet */}
        {nowhere.name.toLowerCase().includes(asked) &&
          row(nowhere, CircleDashed, 'mt-2 pl-2')}
        {groups.map((group) => (
          <section key={group.id} className='mt-3 first:mt-2'>
            {/* Each home on a band of its own, over all that's in it */}
            <p className='flex items-center gap-2.5 rounded-lg bg-ink/7 px-2 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-ink'>
              <House size={14} className='shrink-0' />
              {group.home}
            </p>
            {group.attic && row(group.attic, Inbox, 'mt-1 pl-2')}
            {group.rooms.map((room) => (
              <div key={room.id} className='mt-2'>
                {room.target ? (
                  row(room.target, DoorOpen, 'pl-2 font-serif text-base')
                ) : (
                  <p className='flex items-center gap-2.5 px-2 py-1.5 font-serif text-base text-ink'>
                    <DoorOpen size={14} className='shrink-0 text-muted' />
                    {room.name}
                  </p>
                )}
                {/* Its bookcases, in from it, their shelves in from those */}
                <div className='ml-[15px] border-l border-line/70 pl-2'>
                  {room.units.map((unit) => (
                    <div key={unit.id}>
                      {unit.target ? (
                        row(
                          unit.target,
                          LibraryBig,
                          'pl-2 text-[13px] text-ink-soft',
                        )
                      ) : (
                        <p className='flex items-center gap-2.5 px-2 pb-0.5 pt-2 text-[13px] text-muted'>
                          <LibraryBig size={14} className='shrink-0' />
                          {unit.name}
                        </p>
                      )}
                      {unit.shelves.map((shelf) => row(shelf, Rows3, 'pl-7'))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
        {!groups.length && !nowhere.name.toLowerCase().includes(asked) && (
          <p className='px-2 pt-4 text-sm text-muted'>No place by that name.</p>
        )}
      </div>
    </Popover>
  );
}
