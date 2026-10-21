import { Plus } from 'lucide-react';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { paths } from '@/shared/config/paths';

// The one thing in the header worth reaching for, so it's the darkest and
// the biggest. Just "Add" on a phone; the narrowest get only the plus.
export function AddBookButton() {
  return (
    <TransitionLink
      to={paths.addBook}
      aria-label='Add a book'
      className='group ml-1 inline-flex h-9 animate-rise items-center justify-center gap-2 rounded-full bg-button px-4 text-sm text-button-text shadow-[0_12px_24px_-12px_rgba(40,28,14,0.6)] transition-colors duration-500 ease-soft hover:bg-button-hover max-[359px]:w-9 max-[359px]:px-0 sm:ml-2 sm:h-12 sm:gap-2.5 sm:px-7 sm:text-[15px]'
    >
      <Plus
        size={17}
        className='shrink-0 transition-transform duration-700 ease-soft group-hover:rotate-90'
      />
      <span className='max-[359px]:hidden sm:hidden'>Add</span>
      <span className='hidden sm:inline'>Add a book</span>
    </TransitionLink>
  );
}
