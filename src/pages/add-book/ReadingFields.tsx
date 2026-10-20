import type { ReadingState } from '@/entities/book/types';
import { Choices } from '@/shared/ui/Choices';
import { Collapse } from '@/shared/ui/Collapse';
import { DateField } from '@/shared/ui/DateField';
import type { DraftForm } from './AddBookForm';
import { startOfSpan } from './dayRange';

const readingStates: { value: ReadingState; label: string }[] = [
  { value: 'read', label: 'Read it' },
  { value: 'reading', label: 'Reading now' },
  { value: 'unread', label: 'Not yet' },
];

// Whether the reader has read it, and from when to when. A book read but
// with no finish yet goes under Reading now, so the reader is told so.
export function ReadingFields({ form }: { form: DraftForm }) {
  const reading = form.values['copy.reading'];
  const read = reading === 'read';
  const started = form.values['copy.started'];

  return (
    <div>
      <Choices
        label='Have you read it?'
        options={readingStates}
        value={reading}
        onChange={(next) => form.setValue('copy.reading', next)}
        clearable
      />
      <Collapse open={read || reading === 'reading'}>
        {/* The start comes first, so the finish after it can fold away
            without leaving a gap */}
        <div className='grid gap-x-6 pt-6 sm:grid-cols-2 sm:gap-y-6'>
          <DateField
            past
            label='Started'
            hint='If you remember.'
            {...startOfSpan(form, 'copy.started', 'copy.finished')}
          />
          <Collapse open={read}>
            <DateField
              past
              className='max-sm:pt-6'
              label='Finished'
              earliest={started}
              hint={
                started
                  ? 'If left empty, it goes under Reading now.'
                  : 'If you remember.'
              }
              {...form.choice('copy.finished')}
            />
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
