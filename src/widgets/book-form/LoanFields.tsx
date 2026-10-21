import type { CopyStatus } from '@/entities/book/types';
import { Choices } from '@/shared/ui/Choices';
import { Collapse } from '@/shared/ui/Collapse';
import { DateField } from '@/shared/ui/DateField';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './BookForm';
import { startOfSpan } from './dayRange';

const statuses: { value: CopyStatus; label: string }[] = [
  { value: 'shelf', label: 'With me' },
  { value: 'lent', label: 'Lent out' },
  { value: 'borrowed', label: 'Borrowed' },
];

// Who has the book, and for a loan, who and since when
export function LoanFields({ form }: { form: DraftForm }) {
  const status = form.values['copy.status'];
  const lending = status === 'lent';

  return (
    <div>
      <Choices
        label='Who has it'
        options={statuses}
        value={status}
        onChange={(next) => {
          form.setValue('copy.status', next);
          form.clearError('copy.person');
        }}
        clearable
      />
      <Collapse open={status === 'lent' || status === 'borrowed'}>
        <div className='grid gap-6 pt-6 sm:grid-cols-2'>
          <TextField
            className='sm:col-span-2'
            label={lending ? 'Lent to' : 'Borrowed from'}
            placeholder={lending ? 'Who has it now' : 'Whose book it is'}
            {...form.field('copy.person')}
          />
          <DateField
            past
            label={lending ? 'Lent on' : 'Borrowed on'}
            hint='If you remember.'
            {...startOfSpan(form, 'copy.since', 'copy.due')}
          />
          <DateField
            label={lending ? 'Due back' : 'Give back by'}
            earliest={form.values['copy.since']}
            hint='If you agreed on a day.'
            {...form.choice('copy.due')}
          />
        </div>
      </Collapse>
    </div>
  );
}
