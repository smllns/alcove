import { useEffect, useRef } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { scrollToTop } from '@/shared/lib/motion';
import { sections, type SectionKey } from './sections';
import { floatingClass } from '@/shared/ui/surfaces';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { softClass } from '@/shared/ui/buttonStyles';

const ReturnLink = (props: LinkProps) => (
  <TransitionLink transition='return' {...props} />
);

// The parts of the library: a small capsule floating over the shelves,
// which stays in view while the books scroll by underneath. Switching
// sections changes the page in place, without a page transition. Scrolls
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
  const Tab = current ? Link : ReturnLink;
  const list = useRef<HTMLUListElement>(null);

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
      className='pointer-events-none sticky top-3 z-20 -mx-3 flex justify-center sm:top-5 sm:mx-0 xl:top-7 xl:-mt-25'
    >
      <ul
        ref={list}
        className={cn(
          'pointer-events-auto relative flex max-w-full animate-rise overflow-x-auto rounded-full p-1 scrollbar-none sm:gap-1 sm:p-1.5',
          floatingClass,
        )}
      >
        {sections.map((section) => {
          const on = section.key === current;
          const count = counts[section.key];
          return (
            <li key={section.key} className='shrink-0'>
              <Tab
                to={section.path}
                aria-current={on ? 'page' : undefined}
                // The section already open: back to its top instead
                onClick={(e) => {
                  if (!on) return;
                  e.preventDefault();
                  scrollToTop();
                }}
                className={softClass(
                  on,
                  'flex items-baseline gap-1.5 whitespace-nowrap px-2.5 py-2 font-serif text-[15px] tracking-[-0.01em] sm:gap-2 sm:px-5 sm:text-[17px]',
                )}
              >
                {section.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      'font-sans text-xs tabular-nums',
                      on ? 'text-muted' : 'text-faint',
                    )}
                  >
                    {count}
                  </span>
                )}
              </Tab>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
