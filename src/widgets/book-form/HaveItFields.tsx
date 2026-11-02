import { nonPhysicalWays } from '@/entities/book/nonPhysical';
import { Choices } from '@/shared/ui/Choices';
import { Collapse } from '@/shared/ui/Collapse';
import { FieldNote } from '@/shared/ui/FieldNote';
import type { DraftForm } from './BookForm';
import { isNonPhysical } from './draft';

const answers: { value: 'yes' | 'no'; label: string }[] = [
  { value: 'yes', label: 'Yes, on my shelves' },
  { value: 'no', label: 'No' },
];

// The first thing asked of a book: whether the reader has it on their
// shelves, and for one they don't, how they read it (on a screen, from a
// library, once their own…). What else the form asks follows from it.
export function HaveItFields({ form }: { form: DraftForm }) {
  const away = isNonPhysical(form.values);
  const error = form.errors['copy.nonPhysical'];
  return (
    // Set apart from the book's details by a rule
    <div className='mb-2 border-b border-line pb-8'>
      <Choices
        label='Do you have it?'
        options={answers}
        value={form.values.physical}
        onChange={(physical) => physical && form.setValue('physical', physical)}
      />
      <Collapse open={away}>
        <div className='flex flex-col gap-3 pt-6'>
          <Choices
            label='How did you read it?'
            options={nonPhysicalWays}
            value={form.values['copy.nonPhysical']}
            onChange={(way) => form.setValue('copy.nonPhysical', way)}
          />
          <FieldNote id='non-physical-note' error={error} />
        </div>
      </Collapse>
    </div>
  );
}
