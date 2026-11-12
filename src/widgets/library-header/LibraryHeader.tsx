import { useCallback, useState } from 'react';
import { Newspaper, Search, Settings } from 'lucide-react';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { IconButton } from '@/shared/ui/IconButton';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { AddBookButton } from './AddBookButton';
import { useFeed } from '@/entities/reader/queries';
import { FeedDrawer } from './FeedDrawer';
import { HeaderSearch } from './HeaderSearch';
import { SearchDialog } from './search/SearchDialog';
import { useShortcut } from './useShortcut';
import { holdKeyboard } from '@/shared/lib/keyboard';
import { paths } from '@/shared/config/paths';

// The header over the library and the pages in it: the logo, the search
// over everything beside it (on a phone, a button among the others; ⌘K
// from anywhere), then the feed (a dot on it while there's something new),
// settings (the theme among them), and (once there's a shelf to add to)
// adding a book
export function LibraryHeader({
  adding = true,
  className,
}: {
  adding?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<'search' | 'feed' | null>(null);
  const unread = useFeed().data?.unread ?? 0;
  const close = () => setOpen(null);
  // On a phone, the keyboard comes up with it, the field taking it at once
  const search = useCallback(() => {
    holdKeyboard();
    setOpen('search');
  }, []);
  useShortcut('k', search);
  return (
    <SiteHeader
      home={paths.library}
      className={className}
      beside={
        <HeaderSearch
          onOpen={search}
          className='pointer-events-auto ml-8 w-64 max-sm:hidden xl:w-60 2xl:w-72'
        />
      }
    >
      <IconButton aria-label='Search' onClick={search} className='sm:hidden'>
        <Search size={16} />
      </IconButton>
      <IconButton
        aria-label={unread ? `Feed, ${unread} new` : 'Feed'}
        onClick={() => setOpen('feed')}
        className='relative'
      >
        <Newspaper size={16} />
        {unread > 0 && (
          <span className='absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-surface sm:right-2 sm:top-2' />
        )}
      </IconButton>
      <TransitionLink
        to={paths.settings}
        aria-label='Settings'
        className={iconButtonClass()}
      >
        <Settings
          size={16}
          className='transition-transform duration-700 ease-soft group-hover:rotate-45'
        />
      </TransitionLink>
      {adding && <AddBookButton />}
      <SearchDialog open={open === 'search'} onClose={close} />
      <FeedDrawer open={open === 'feed'} onClose={close} />
    </SiteHeader>
  );
}
