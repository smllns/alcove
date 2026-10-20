import { useLocation } from 'react-router';
import { useAuth } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import type { AuthMode } from './authCopy';

// One form for both modes, so the email you typed survives switching between
// log in and sign up. On success, goes back to the page that sent the reader
// here; otherwise a new reader is welcomed in, and a returning one goes to
// their library.
export function useAuthForm(mode: AuthMode) {
  const { login, register } = useAuth();
  const navigate = useTransitionNavigate();
  const location = useLocation();

  return useForm(
    { name: '', email: '', password: '' },
    async (values) => {
      if (mode === 'login') {
        await login({ email: values.email, password: values.password });
      } else {
        await register(values);
      }
      const from = (location.state as { from?: string } | null)?.from;
      navigate(
        from ?? (mode === 'register' ? '/welcome' : '/library'),
        'forward',
        { replace: true },
      );
    },
    // Old complaints don't carry over to the other form
    { resetErrorsOn: mode },
  );
}
