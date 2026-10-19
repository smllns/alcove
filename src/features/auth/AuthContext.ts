import { createContext } from 'react';
import type { LoginInput, RegisterInput } from '@/entities/user/api';
import type { User } from '@/entities/user/types';

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'signed-in'; user: User };

export type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  // After the account itself changed (settings): new details, or gone
  replaceUser: (user: User) => void;
  forgetUser: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
