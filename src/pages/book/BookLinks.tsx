import { useState } from 'react';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { plural } from '@/shared/lib/plural';
import { outlineCardClass } from '@/shared/ui/surfaces';
import { ArrowIcon } from '@/shared/ui/ArrowIcon';
import { BookSection } from './BookSection';

// "open.spotify.com" → "spotify.com", for a link's address in brief
const siteOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^(www|open|m)\./, '');
  } catch {
    return url;
  }
};

// A site's own small icon, by way of DuckDuckGo's icon service (which is
// told only the site's name); its first letter while it loads, or if it
// has none
function SiteIcon({ site }: { site: string }) {
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <span
      aria-hidden
      className='relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-ink/7 font-serif text-[17px] text-ink uppercase'
    >
      {!shown && site.charAt(0)}
      {!failed && (
        <img
          src={`https://icons.duckduckgo.com/ip3/${site}.ico`}
          alt=''
          onLoad={(e) =>
            // A blank answer is as good as none
            e.currentTarget.naturalWidth > 1 ? setShown(true) : setFailed(true)
          }
          onError={() => setFailed(true)}
          className={cn(
            'absolute size-5 transition-opacity duration-500 ease-soft',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </span>
  );
}

// The reader's links, each a small card: the site's own icon, the link's
// name, and the site it's on
export function BookLinks({ book }: { book: Book }) {
  const links = book.copy?.links ?? [];
  if (!links.length) return null;

  return (
    <BookSection title={plural(links.length, 'Related link')}>
      <ul className='grid gap-3 sm:grid-cols-2'>
        {links.map((link, i) => {
          const site = siteOf(link.url);
          return (
            <li key={i}>
              <a
                href={link.url}
                target='_blank'
                rel='noreferrer'
                className={cn(
                  outlineCardClass,
                  'group flex items-center gap-3 bg-surface/35 p-3 transition-colors duration-500 ease-soft hover:border-ink/40 hover:bg-surface/70',
                )}
              >
                <SiteIcon site={site} />
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[15px] text-ink'>
                    {link.label || site}
                  </span>
                  {link.label && (
                    <span className='block truncate text-xs text-muted'>
                      {site}
                    </span>
                  )}
                </span>
                <span className='shrink-0 text-muted'>
                  <ArrowIcon size={15} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </BookSection>
  );
}
