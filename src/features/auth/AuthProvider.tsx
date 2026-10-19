import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as userApi from '@/entities/user/api';
import type { User } from '@/entities/user/types';
import { AuthContext, type AuthState } from './AuthContext';

const signedIn = (user: User): AuthState => ({ status: 'signed-in', user });
const guest: AuthState = { status: 'guest', user: null };

// Knows who's signed in. Asks the server once on load; login, register and
// logout keep it up to date after that.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    userApi
      .fetchCurrentUser()
      .then((user) => !cancelled && setState(user ? signedIn(user) : guest))
      // Server unreachable: carry on as a guest; forms will show the real error
      .catch(() => !cancelled && setState(guest));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: userApi.LoginInput) => {
    const user = await userApi.login(input);
    setState(signedIn(user));
    return user;
  }, []);

  const register = useCallback(async (input: userApi.RegisterInput) => {
    const user = await userApi.register(input);
    setState(signedIn(user));
    return user;
  }, []);

  const logout = useCallback(async () => {
    await userApi.logout();
    setState(guest);
  }, []);

  const replaceUser = useCallback((user: User) => setState(signedIn(user)), []);
  const forgetUser = useCallback(() => setState(guest), []);

  const value = useMemo(
    () => ({ ...state, login, register, logout, replaceUser, forgetUser }),
    [state, login, register, logout, replaceUser, forgetUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
