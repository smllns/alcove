import { updatePassword } from '@/entities/user/api';
import { useForm } from '@/shared/lib/useForm';
import { FormError } from '@/shared/ui/FormError';
import { PasswordField } from '@/shared/ui/PasswordField';
import { SaveButton } from './SaveButton';

export function PasswordForm() {
  const form = useForm(
    { currentPassword: '', newPassword: '' },
    updatePassword,
    {
      clearOnSuccess: ['currentPassword', 'newPassword'],
    },
  );
  const empty = !form.values.currentPassword || !form.values.newPassword;

  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col gap-6'>
      <PasswordField
        label='Current password'
        autoComplete='current-password'
        {...form.field('currentPassword')}
      />
      <PasswordField
        label='New password'
        autoComplete='new-password'
        hint='At least 8 characters.'
        {...form.field('newPassword')}
      />
      <FormError message={form.formError} />
      <SaveButton
        status={form.status}
        label='Change password'
        disabled={empty && form.status !== 'saved'}
      />
    </form>
  );
}
