import type { Ref } from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';

export type Step = 'book' | 'copy';

const names: Record<Step, string> = { book: 'The book', copy: 'Your copy' };

// What each holds, so it's plain which to go to for what
const holds: Record<Step, string> = {
  book: 'Title, author, edition, what it’s about',
  copy: 'Reading, rating, where it lives, notes',
};

// Above the form: adding goes one step after the other, so it says which
// step this is; changing a book on the shelves can go to either at will,
// each saying what's in it
export function StepHeading({
  ref,
  step,
  onStep,
}: {
  ref: Ref<HTMLDivElement>;
  step: Step;
  // Given when the steps can be switched between
  onStep?: (step: Step) => void;
}) {
  if (!onStep)
    return (
      <div
        ref={ref}
        className={cn('mb-8 flex items-baseline gap-3', labelClass)}
      >
        <span className='text-faint'>Step {step === 'book' ? 1 : 2} of 2</span>
        <span className='text-ink'>{names[step]}</span>
      </div>
    );

  return (
    <div ref={ref} className='mb-8'>
      <p className={cn('mb-3', labelClass)}>What to change</p>
      <div
        role='tablist'
        aria-label='What to change'
        className='grid grid-cols-2 gap-2 rounded-2xl border border-line/70 p-1.5'
      >
        {(['book', 'copy'] as const).map((each) => {
          const on = each === step;
          return (
            <button
              key={each}
              type='button'
              role='tab'
              aria-selected={on}
              onClick={() => onStep(each)}
              className={cn(
                'cursor-pointer rounded-xl px-4 py-3 text-left transition-colors duration-500 ease-soft',
                on
                  ? 'bg-button text-button-text'
                  : 'text-ink-soft hover:bg-ink/5 hover:text-ink',
              )}
            >
              <span className='block font-serif text-[17px] tracking-[-0.01em]'>
                {names[each]}
              </span>
              <span
                className={cn(
                  'mt-0.5 block text-xs leading-snug',
                  on ? 'opacity-70' : 'text-muted',
                )}
              >
                {holds[each]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
