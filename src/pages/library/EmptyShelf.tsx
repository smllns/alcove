import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Lead } from '@/shared/ui/PageHeading';

export function EmptyShelf() {
  return (
    <div
      className='flex animate-rise flex-col items-center text-center'
      style={{ animationDelay: '240ms' }}
    >
      {/* A bare shelf */}
      <div
        aria-hidden
        className='mb-10 h-px w-56 bg-line shadow-[0_6px_14px_-4px_rgba(40,28,14,0.35)]'
      />
      <Lead className='max-w-sm'>
        Your shelves are empty for now. Add the first book you can reach, and
        the rest will follow.
      </Lead>
      <ButtonLink to='/library/add' arrow className='mt-8'>
        Add your first book
      </ButtonLink>
    </div>
  );
}
