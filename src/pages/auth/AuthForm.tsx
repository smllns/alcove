import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { PasswordField } from '@/shared/ui/PasswordField';
import { usernameField } from '@/entities/user/usernameField';
import { TextField } from '@/shared/ui/TextField';
import { Typewriter } from '@/shared/ui/Typewriter';
import { authCopy, type AuthMode } from './authCopy';
import { FormError } from '@/shared/ui/FormError';
import { useAuthForm } from './useAuthForm';

type AuthFormProps = {
  mode: AuthMode;
  // When the button label starts retyping after a mode switch
  typeDelay?: number;
};

// Email and password stay put between modes; the username and the
// password hint open and close around them.
export function AuthForm({ mode, typeDelay = 0 }: AuthFormProps) {
  const form = useAuthForm(mode);
  const registering = mode === 'register';

  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col'>
      <Collapse open={registering}>
        <TextField
          {...usernameField}
          required={registering}
          className='pb-6 sm:pb-7'
          {...form.field('username')}
        />
      </Collapse>

      <TextField
        label='Email'
        type='email'
        autoComplete='email'
        inputMode='email'
        required
        className='pb-6 sm:pb-7'
        {...form.field('email')}
      />

      <PasswordField
        label='Password'
        autoComplete={registering ? 'new-password' : 'current-password'}
        hint={registering ? 'At least 8 characters.' : undefined}
        required
        {...form.field('password')}
      />

      <div className='mt-6 empty:hidden sm:mt-7'>
        <FormError message={form.formError} />
      </div>

      <Button
        type='submit'
        arrow
        loading={form.status === 'saving'}
        className='mt-8 self-start sm:mt-9'
      >
        <Typewriter text={authCopy[mode].submit} delay={typeDelay} />
      </Button>
    </form>
  );
}
