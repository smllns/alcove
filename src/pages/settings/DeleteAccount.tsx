import { useState, type SubmitEvent } from 'react';
import { deleteAccount } from '@/entities/user/api';
import { useAuth, useLeaveForHome } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { PasswordField } from '@/shared/ui/PasswordField';

// Set apart at the foot of the settings, in a thin red frame. Two steps:
// ask, then confirm with the password.
export function DeleteAccount({
  id,
  delay,
}: {
  // Where the index leads to (SettingsIndex)
  id: string;
  delay: number;
}) {
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
    <section
      id={id}
      className='scroll-mt-28 animate-rise rounded-[24px] border border-danger/35 px-5 py-5 sm:px-6'
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className='flex flex-wrap items-center gap-x-6 gap-y-4'>
        <div className='min-w-0 flex-1'>
          <h2 className='font-serif text-xl tracking-[-0.01em] text-danger'>
            Delete account
          </h2>
          <p className='mt-1 text-sm text-muted'>
            Your account and your whole library. This can’t be undone.
          </p>
        </div>
        <Button
          variant='danger'
          aria-expanded={confirming}
          onClick={() => setConfirming(true)}
          disabled={confirming}
          className='shrink-0'
        >
          Delete
        </Button>
      </div>

      <Collapse open={confirming}>
        <form
          onSubmit={onSubmit}
          noValidate
          className='flex flex-col gap-6 pt-6'
        >
          <p className='text-sm leading-6 text-ink-soft'>
            Everything in your library will be gone for good. Enter your
            password to confirm.
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
    </section>
  );
}
