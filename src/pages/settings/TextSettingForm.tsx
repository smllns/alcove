import type { ComponentProps } from 'react';
import type { User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { FormError } from '@/shared/ui/FormError';
import { TextField } from '@/shared/ui/TextField';
import { SaveButton } from './SaveButton';

// One line of text about the reader changed in its row of the settings
// (SettingRow, which says what it is): their name, their username. `field`:
// what the server calls it, so its complaints land on the field.
export function TextSettingForm({
  field,
  value,
  save,
  ...props
}: {
  field: string;
  value: string;
  save: (value: string) => Promise<User>;
} & Omit<ComponentProps<typeof TextField>, 'value'>) {
  const { replaceUser } = useAuth();
  const form = useForm({ [field]: value }, async (values) =>
    replaceUser(await save(values[field])),
  );
  const unchanged = form.values[field].trim() === value;

  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col gap-6'>
      <TextField labelHidden {...props} {...form.field(field)} />
      <FormError message={form.formError} />
      <SaveButton
        status={form.status}
        disabled={unchanged && form.status !== 'saved'}
      />
    </form>
  );
}
