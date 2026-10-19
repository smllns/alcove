import { updateEmail } from '@/entities/user/api';
import type { User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { PasswordField } from '@/shared/ui/PasswordField';
import { TextField } from '@/shared/ui/TextField';
import { SaveButton } from './SaveButton';

export function EmailForm({ user }: { user: User }) {
  const { replaceUser } = useAuth();
  const form = useForm(
    { email: user.email, password: '' },
    async (values) => replaceUser(await updateEmail(values)),
    { clearOnSuccess: ['password'] },
  );
  const changed = form.values.email.trim().toLowerCase() !== user.email;

  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col'>
      <TextField
        label='Email'
        type='email'
        autoComplete='email'
        inputMode='email'
        required
        {...form.field('email')}
      />
      {/* Asked for only once there's something to confirm */}
      <Collapse open={changed}>
        <PasswordField
          label='Current password'
          autoComplete='current-password'
          hint='To make sure it’s really you.'
          className='pt-6'
          {...form.field('password')}
        />
      </Collapse>
      <div className='mt-6 flex flex-col gap-6'>
        <FormError message={form.formError} />
        <SaveButton
          status={form.status}
          disabled={!changed && form.status !== 'saved'}
        />
      </div>
    </form>
  );
}
