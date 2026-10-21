import { Settings } from 'lucide-react';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { AddBookButton } from './AddBookButton';
import { paths } from '@/shared/config/paths';

// The header over the library and the pages in it: the logo, the theme,
// settings, and (once there's a shelf to add to) adding a book
export function LibraryHeader({
  adding = true,
  className,
}: {
  adding?: boolean;
  className?: string;
}) {
  return (
    <SiteHeader home={paths.library} className={className}>
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
    </SiteHeader>
  );
}
