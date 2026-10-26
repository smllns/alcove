import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { scrollToTop } from '@/shared/lib/motion';
import { sections, type SectionKey } from './sections';
import { floatingClass } from '@/shared/ui/surfaces';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { softClass } from '@/shared/ui/buttonStyles';
import { useTabPill } from './useTabPill';

// The parts of the library: a small capsule floating over the shelves,
// which stays in view while the books scroll by underneath. Switching
// sections turns the page under the tabs, the section chosen rising over
// the one left (the 'onward' transition), the open one's shading gliding
// over to the tab chosen. Scrolls
// sideways on a phone, where the tabs don't all fit. On a wide screen it
// sits in the header row, between the logo and the buttons. On a page
// within the library (a book's), no tab is `current`, and each leads back
// out to its section the way the reader goes back.
export function LibraryNav({
  current,
  counts,
}: {
  current?: SectionKey;
  counts: Partial<Record<SectionKey, number>>;
}) {
  const list = useRef<HTMLUListElement>(null);
  const pill = useTabPill(list, current);

  // Keep the open section in view on a narrow screen
  useEffect(() => {
    const ul = list.current;
    const tab = ul?.querySelector<HTMLElement>('[aria-current=page]');
    if (!ul || !tab) return;
    ul.scrollTo({
      left: tab.offsetLeft - (ul.clientWidth - tab.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [current]);

  return (
    <nav
      aria-label='Library'
      // Where there's room (xl), it's pulled up into the header row, level
      // with the logo: the header is 112px tall and the content starts 16px
      // under it, so 100px up puts the 56px capsule on the header's middle.
      // It sticks at that same height once the page scrolls.
      className='library-nav pointer-events-none sticky top-3 z-20 -mx-3 flex justify-center sm:top-5 sm:mx-0 xl:top-7 xl:-mt-25'
    >
      <ul
        ref={list}
        className={cn(
          'pointer-events-auto relative flex max-w-full animate-rise overflow-x-auto rounded-full p-1 scrollbar-none sm:gap-1 sm:p-1.5',
          floatingClass,
        )}
      >
        {pill.at && (
          <span
            aria-hidden
            // Gliding on through the page turning under it, not settled at
            // once like what comes in with the section (settleEntrances);
            // the tabs changing colour along with it, the same
            data-moves-along
            className={cn(
              'absolute left-0 top-0 rounded-full bg-ink/7',
              pill.glides &&
                'transition-[translate,width] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]',
            )}
            style={pill.at}
          />
        )}
        {sections.map((section) => {
          const on = section.key === current;
          const lit = section.key === pill.lit;
          const count = counts[section.key];
          return (
            <li key={section.key} className='shrink-0'>
              <TransitionLink
                to={section.path}
                transition={current ? 'onward' : 'return'}
                aria-current={on ? 'page' : undefined}
                data-section={section.key}
                data-moves-along
                // The section already open: back to its top instead
                onClick={(e) => {
                  if (!on) return;
                  e.preventDefault();
                  scrollToTop();
                }}
                className={cn(
                  'relative flex items-baseline gap-1.5 whitespace-nowrap px-2.5 py-2 font-serif text-[15px] tracking-[-0.01em] sm:gap-2 sm:px-5 sm:text-[17px]',
                  // The open one's shading is the pill under them all
                  lit
                    ? 'cursor-pointer rounded-full text-ink transition-colors duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]'
                    : softClass(false),
                )}
              >
                {section.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      'font-sans text-xs tabular-nums transition-colors duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]',
                      lit ? 'text-muted' : 'text-faint',
                    )}
                  >
                    {count}
                  </span>
                )}
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
