import { useState, type SubmitEvent } from 'react';
import { deleteAccount } from '@/entities/user/api';
import { useAuth, useLeaveForHome } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { PasswordField } from '@/shared/ui/PasswordField';

// Two steps: ask, then confirm with the password
export function DeleteAccount() {
  const { forgetUser } = useAuth();
  const leaveForHome = useLeaveForHome();
  const [confirming, setConfirming] = useState(false);
  const form = useForm({ password: '' }, ({ password }) =>
    deleteAccount(password),
  );

  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!(await form.onSubmit())) return;
    await leaveForHome(forgetUser);
  };

  return (
    <div className='flex flex-col'>
      <Collapse open={!confirming}>
        <Button
          variant='danger'
          onClick={() => setConfirming(true)}
          className='self-start'
        >
          Delete account
        </Button>
      </Collapse>

      <Collapse open={confirming}>
        <form onSubmit={onSubmit} noValidate className='flex flex-col gap-6'>
          <p className='text-sm leading-6 text-ink-soft'>
            Your account and everything in your library will be gone for good.
            Enter your password to confirm.
          </p>
          <PasswordField
            label='Password'
            autoComplete='current-password'
            {...form.field('password')}
          />
          <FormError message={form.formError} />
          <div className='flex flex-wrap items-center gap-3'>
            <Button
              type='submit'
              variant='danger'
              loading={form.status === 'saving'}
              disabled={!form.values.password}
            >
              Delete forever
            </Button>
            <Button
              variant='pill'
              onClick={() => {
                setConfirming(false);
                form.setValues({ password: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Collapse>
    </div>
  );
}
