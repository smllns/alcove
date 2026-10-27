import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Home } from '@/entities/place/types';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { labelClass } from '@/shared/ui/fieldStyles';
import { Popover } from '@/shared/ui/Popover';
import { Typewriter } from '@/shared/ui/Typewriter';

// The home shown, its name the section's title, how many books it holds
// under it; with more homes than one, a menu of them all to switch to
// (each with its own count), opening softly from the name
export function HomeTitle({
  homes,
  home,
  onHome,
}: {
  homes: { home: Home; count: number }[];
  // The one shown
  home: string;
  onHome: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const title = useRef<HTMLButtonElement>(null);
  const shown = homes.find((each) => each.home.id === home) ?? homes[0];
  const many = homes.length > 1;
  return (
    <>
      <button
        ref={title}
        type='button'
        disabled={!many}
        aria-haspopup={many ? 'menu' : undefined}
        aria-expanded={many ? open : undefined}
        onClick={() => setOpen(!open)}
        // Typed over as another home is chosen, staying put while the page
        // under it changes (home-title, transitions-in-place.css)
        className='home-title group -mx-3 flex min-w-0 cursor-pointer flex-col items-center rounded-2xl px-3 py-1.5 text-center transition-colors duration-500 ease-soft enabled:hover:bg-ink/5 disabled:cursor-default sm:items-start sm:text-left'
      >
        {/* Its name, the menu's arrow right by it, in a ring as a button */}
        <span className='flex min-w-0 max-w-full items-center gap-2.5'>
          <span className='truncate font-serif text-[28px] leading-tight tracking-[-0.02em] text-ink sm:text-[32px]'>
            <Typewriter text={shown.home.name} pace={0.8} />
          </span>
          {many && (
            <span className='mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface/70 text-ink-soft transition-colors duration-500 ease-soft group-hover:border-ink group-hover:text-ink'>
              <ChevronDown
                size={15}
                className={cn(
                  'transition-[rotate] duration-500 ease-soft',
                  open && 'rotate-180',
                )}
              />
            </span>
          )}
        </span>
        <span className={cn('mt-1', labelClass)}>
          <Typewriter
            text={counted(shown.count, 'book')}
            delay={60}
            pace={0.7}
          />
        </span>
      </button>
      <Popover
        open={open}
        anchor={title}
        width={280}
        onClose={() => setOpen(false)}
      >
        <div role='menu' className='p-1.5'>
          {homes.map(({ home: each, count }) => (
            <button
              key={each.id}
              type='button'
              role='menuitemradio'
              aria-checked={each.id === home}
              onClick={() => {
                setOpen(false);
                if (each.id !== home) onHome(each.id);
              }}
              className={cn(
                'flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition-colors duration-300 ease-soft hover:bg-ink/6',
                each.id === home ? 'text-ink' : 'text-ink-soft',
              )}
            >
              <span
                className={cn(
                  'truncate font-serif text-[17px]',
                  each.id === home &&
                    'underline decoration-line underline-offset-4',
                )}
              >
                {each.name}
              </span>
              <span className='shrink-0 text-xs tabular-nums text-muted'>
                {count}
              </span>
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}
