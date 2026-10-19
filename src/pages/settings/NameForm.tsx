import { updateName } from '@/entities/user/api';
import type { User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { FormError } from '@/shared/ui/FormError';
import { TextField } from '@/shared/ui/TextField';
import { SaveButton } from './SaveButton';

export function NameForm({ user }: { user: User }) {
  const { replaceUser } = useAuth();
  const form = useForm({ name: user.name }, async ({ name }) =>
    replaceUser(await updateName(name)),
  );
  const unchanged = form.values.name.trim() === user.name;

  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col gap-6'>
      <TextField
        label='Name'
        autoComplete='name'
        required
        {...form.field('name')}
      />
      <FormError message={form.formError} />
      <SaveButton
        status={form.status}
        disabled={unchanged && form.status !== 'saved'}
      />
    </form>
  );
}
