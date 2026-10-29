import { cn } from '@/shared/lib/cn';
import { stackNameClass, stacksClass } from './ListStack';

// Where the reader's lists stand while there are none: in the first of
// their places, the place of a pile on a floor drawn faint, "01 Your
// first list" under it, and beside it what a list might be for. Pressed,
// the list's begun (`onStart`).
export function FirstList({ onStart }: { onStart: () => void }) {
  return (
    <div className={stacksClass}>
      <div className='group flex w-full max-w-36 flex-col items-center justify-self-center'>
        <button
          type='button'
          onClick={onStart}
          // The name under it says what it does
          tabIndex={-1}
          aria-hidden
          className='flex w-full cursor-pointer flex-col items-center justify-end pt-10 transition-transform duration-500 ease-soft group-hover:-translate-y-1'
        >
          {/* The place a book would lie */}
          <span className='mb-px block h-3 w-24 rounded-[2px] border border-dashed border-faint' />
          <span className='room-floor mx-0! block w-full opacity-35 transition-opacity duration-500 ease-soft group-hover:opacity-70' />
        </button>
        <button
          type='button'
          onClick={onStart}
          className={cn(
            stackNameClass,
            'cursor-pointer text-muted transition-colors duration-300 ease-soft group-hover:text-ink',
          )}
        >
          <span className='mr-[0.6em] tracking-[0.12em]'>01</span>
          Your first list
        </button>
        {/* The room of the count a list has under it */}
        <p aria-hidden className='invisible mt-1 text-xs'>
          0 books
        </p>
      </div>
      <p className='max-w-xs self-center text-balance text-sm leading-relaxed text-muted sm:col-span-2'>
        For the books you mean to read this summer, the best of the year, the
        ones to lend.
      </p>
    </div>
  );
}
