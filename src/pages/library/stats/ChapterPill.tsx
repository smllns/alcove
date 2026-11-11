import { ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Popover } from '@/shared/ui/Popover';
import { floatingClass } from '@/shared/ui/surfaces';
import { ChapterTag } from './ChapterTag';
import { StatsContents, type ContentsSection } from './StatsContents';

// On a phone, where there's no room for the contents beside the chapters:
// the chapter being read, small, floating at the foot of the screen from
// the start; tapped, the contents open over it, to go to another
export function ChapterPill({
  sections,
  shown,
  onGo,
}: {
  sections: ContentsSection[];
  shown: string;
  onGo: (id: string) => void;
}) {
  const parts = sections.flatMap((section) => section.parts);
  const [open, setOpen] = useState(false);
  const pill = useRef<HTMLButtonElement>(null);
  const at = Math.max(
    0,
    parts.findIndex(({ id }) => id === shown),
  );
  return (
    <>
      <button
        ref={pill}
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-6 left-4 z-20 flex h-10 max-w-[calc(100vw-6rem)] items-center gap-2 rounded-full pl-4 pr-3 lg:hidden',
          floatingClass,
        )}
      >
        <ChapterTag number={at + 1} />
        <span className='truncate font-serif text-[0.9375rem] text-ink'>
          {parts[at]?.label}
        </span>
        <ChevronUp
          size={15}
          className={cn(
            'shrink-0 text-ink-soft transition-[rotate] duration-500 ease-soft',
            open && 'rotate-180',
          )}
        />
      </button>
      <Popover
        open={open}
        anchor={pill}
        width={280}
        onClose={() => setOpen(false)}
      >
        {/* Scrolling once the contents run taller than the screen */}
        <div className='min-h-0 overflow-y-auto overscroll-contain px-4 py-3'>
          <StatsContents
            sections={sections}
            shown={shown}
            onGo={(id) => {
              setOpen(false);
              onGo(id);
            }}
          />
        </div>
      </Popover>
    </>
  );
}
