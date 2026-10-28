import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { pageScroller, scrollPageToElement } from '@/shared/lib/pageScroll';

const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// The groups of settings listed as a book's contents are, with dots
// leading over to their numbers; the one being read marked, and each a way
// down to its group (SettingsGroup, by id). The last, `danger`, in red.
export function SettingsIndex({
  groups,
}: {
  groups: { id: string; label: string; danger?: boolean }[];
}) {
  const [shown, setShown] = useState(groups[0]?.id);
  // Gone to from here: marked as soon as it's chosen, and kept marked
  // (though the page may not scroll far enough to bring it up top) until
  // the reader scrolls on themselves
  const chosen = useRef<string | null>(null);

  // The group being read: the last whose top has come up past the upper
  // part of the screen
  useEffect(() => {
    const scroller = pageScroller();
    const onScroll = () => {
      if (chosen.current) return;
      let reading = groups[0]?.id;
      for (const { id } of groups) {
        const group = document.getElementById(id);
        if (group && group.getBoundingClientRect().top < innerHeight * 0.4)
          reading = id;
      }
      setShown(reading);
    };
    const letGo = () => (chosen.current = null);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    for (const event of ['wheel', 'touchmove', 'keydown'])
      addEventListener(event, letGo, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      for (const event of ['wheel', 'touchmove', 'keydown'])
        removeEventListener(event, letGo);
    };
  }, [groups]);

  const goTo = (id: string) => {
    const group = document.getElementById(id);
    if (!group) return;
    chosen.current = id;
    setShown(id);
    scrollPageToElement(group);
  };

  return (
    <nav aria-label='Settings' className='flex flex-col'>
      {groups.map(({ id, label, danger }, i) => {
        const on = id === shown;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={on ? 'location' : undefined}
            onClick={(e) => {
              e.preventDefault();
              goTo(id);
            }}
            className={cn(
              'group flex items-baseline gap-2 py-2 font-serif text-[17px] transition-colors duration-500 ease-soft',
              danger
                ? 'text-danger/80 hover:text-danger'
                : on
                  ? 'text-ink'
                  : 'text-muted hover:text-ink',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-1.5 shrink-0 -translate-y-0.75 rounded-full bg-accent transition-opacity duration-500 ease-soft',
                on ? 'opacity-100' : 'opacity-0',
              )}
            />
            {label}
            <span
              aria-hidden
              className='flex-1 -translate-y-1 border-b border-dotted border-line'
            />
            <span className='font-sans text-[11px] tracking-[0.1em] text-faint'>
              {numerals[i]}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
