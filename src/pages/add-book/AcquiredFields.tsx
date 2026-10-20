import { Choices } from '@/shared/ui/Choices';
import { Collapse } from '@/shared/ui/Collapse';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import { sources, ways } from './acquired';
import type { DraftForm } from './AddBookForm';

// How the book came to the reader, from whom, and when. All optional.
export function AcquiredFields({ form }: { form: DraftForm }) {
  const how = form.values['copy.acquired.how'];
  const source = sources[how];

  return (
    <div>
      <Choices
        label='How it came to you'
        options={ways}
        value={how}
        onChange={(next) => form.setValue('copy.acquired.how', next)}
        clearable
      />
      <Collapse open={how === 'other'}>
        <div className='pt-6'>
          <TextField
            label='In your own words'
            placeholder='Won it in a raffle'
            {...form.field('copy.acquired.other')}
          />
        </div>
      </Collapse>
      {/* The date comes first, so the "from" after it can fold away
          without leaving a gap; stacked on a phone, the space above it
          folds away with it */}
      <div className='grid gap-x-6 pt-6 sm:grid-cols-2 sm:gap-y-6'>
        <DateField
          past
          label='When'
          hint='If you remember.'
          {...form.choice('copy.acquired.date')}
        />
        <Collapse open={Boolean(source)}>
          <TextField
            className='max-sm:pt-6'
            label={source?.label ?? 'From'}
            placeholder={source?.placeholder}
            {...form.field('copy.acquired.from')}
          />
        </Collapse>
      </div>
    </div>
  );
}
