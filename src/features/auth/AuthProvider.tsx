import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/entities/user/api';
import type { User } from '@/entities/user/types';
import { AuthContext, type AuthState } from './AuthContext';

const signedIn = (user: User): AuthState => ({ status: 'signed-in', user });
const guest: AuthState = { status: 'guest', user: null };

// Knows who's signed in. Asks the server once on load; login, register and
// logout keep it up to date after that.
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
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

  // Signing out drops every cached answer, so the next person on this
  // browser never glimpses someone else's shelves
  const logout = useCallback(async () => {
    await userApi.logout();
    queryClient.clear();
    setState(guest);
  }, [queryClient]);

  const replaceUser = useCallback((user: User) => setState(signedIn(user)), []);
  const forgetUser = useCallback(() => {
    queryClient.clear();
    setState(guest);
  }, [queryClient]);

  const value = useMemo(
    () => ({ ...state, login, register, logout, replaceUser, forgetUser }),
    [state, login, register, logout, replaceUser, forgetUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
