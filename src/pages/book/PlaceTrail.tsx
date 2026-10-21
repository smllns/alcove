import {
  DoorOpen,
  House,
  LibraryBig,
  Rows3,
  type LucideIcon,
} from 'lucide-react';
import { levelNames, type PlaceLevel } from '@/entities/place/names';
import { cn } from '@/shared/lib/cn';
import { captionClass } from '@/shared/ui/fieldStyles';
import { IconDot } from '@/shared/ui/IconDot';

const icons: Record<PlaceLevel, LucideIcon> = {
  home: House,
  room: DoorOpen,
  unit: LibraryBig,
  shelf: Rows3,
};

// Where the book lives, drawn as the way to it: home, room, bookcase,
// shelf, each a small stop on a line, from the door to the shelf; down the
// page on a phone, across it on a wider screen
export function PlaceTrail({
  path,
}: {
  path: { level: PlaceLevel; name: string }[];
}) {
  return (
    <ol className='flex flex-col text-left sm:flex-row sm:items-start sm:text-center'>
      {path.map(({ level, name }, i) => {
        return (
          <li
            key={level}
            // Spread across the card, the lines stretching between the stops
            className={cn(
              'flex flex-col sm:flex-row sm:items-start',
              i > 0 && 'sm:flex-1',
            )}
          >
            {i > 0 && (
              // The line on from the stop before: down the page on a
              // phone, across it where there's room
              <span
                aria-hidden
                className='ml-[17.5px] h-4 w-0 shrink-0 border-l border-dashed border-line sm:mx-3 sm:mt-4.5 sm:h-0 sm:min-w-4 sm:flex-1 sm:border-t sm:border-l-0'
              />
            )}
            <div className='flex items-center gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center'>
              <IconDot icon={icons[level]} />
              <span className='sm:max-w-28'>
                <span className={`block ${captionClass}`}>
                  {levelNames[level]}
                </span>
                <span className='mt-1 block font-serif text-base leading-snug text-ink'>
                  {name}
                </span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
