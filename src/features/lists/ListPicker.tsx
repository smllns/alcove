import { useListChoice } from './useListChoice';
import { cn } from '@/shared/lib/cn';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { labelClass } from '@/shared/ui/fieldStyles';
import { FormError } from '@/shared/ui/FormError';
import { AddOwnPill } from '@/shared/ui/AddOwnPill';

// The reader's lists as pills to toggle the book in and out of, and a new
// one made on the spot, the book put in it at once
export function ListPicker({
  value,
  onChange,
}: {
  // The ids of the lists the book is in
  value: string[];
  onChange: (lists: string[]) => void;
}) {
  const { lists, chosen, toggle, addNew, failed } = useListChoice(
    value,
    onChange,
  );

  return (
    // A fieldset grows to its widest pill unless told otherwise
    <fieldset className='min-w-0'>
      <legend className={cn('mb-3', labelClass)}>Lists</legend>
      <div className='flex flex-wrap items-center gap-2'>
        {lists.map((list) => {
          const on = chosen.has(list.id);
          return (
            <button
              key={list.id}
              type='button'
              aria-pressed={on}
              onClick={() => toggle(list.id)}
              // A long name is cut short rather than reach past the screen
              title={list.name}
              className={cn(choiceClass(on), 'max-w-full py-1.5')}
            >
              <span className='block truncate'>{list.name}</span>
            </button>
          );
        })}
        <AddOwnPill
          onAdd={(typed) => void addNew(typed).catch(() => {})}
          placeholder='Its name, then Enter'
          label='A new list'
          maxLength={60}
          className='w-48'
        >
          {lists.length ? 'New list' : 'Start a list'}
        </AddOwnPill>
      </div>
      <FormError message={failed} small className='mt-2' />
    </fieldset>
  );
}
