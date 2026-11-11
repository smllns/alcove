import { ApiError, request } from '@/shared/api/http';
import type { Privacy, Reader, User } from './types';

type UserResponse = { user: User };

export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { username: string };

// The signed-in user, or null for a guest
export async function fetchCurrentUser() {
  try {
    return (await request<UserResponse>('/auth/me')).user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export const login = async (input: LoginInput) =>
  (await request<UserResponse>('/auth/login', { method: 'POST', body: input }))
    .user;

export const register = async (input: RegisterInput) =>
  (
    await request<UserResponse>('/auth/register', {
      method: 'POST',
      body: input,
    })
  ).user;

export const logout = () => request<void>('/auth/logout', { method: 'POST' });

// Account settings. Each returns the updated user where there is one.

export const updateName = async (name: string) =>
  (
    await request<UserResponse>('/account/name', {
      method: 'PATCH',
      body: { name },
    })
  ).user;

export const updateAbout = async (about: string) =>
  (
    await request<UserResponse>('/account/about', {
      method: 'PATCH',
      body: { about },
    })
  ).user;

// Their photo, uploaded first, or none
export const updateAvatar = async (url: string | null) =>
  (
    await request<UserResponse>('/account/avatar', {
      method: 'PATCH',
      body: { url },
    })
  ).user;

export const updatePrivacy = async (change: Partial<Privacy>) =>
  (
    await request<UserResponse>('/account/privacy', {
      method: 'PATCH',
      body: change,
    })
  ).user;

export const updateUsername = async (username: string) =>
  (
    await request<UserResponse>('/account/username', {
      method: 'PATCH',
      body: { username },
    })
  ).user;

export const updateEmail = async (input: { email: string; password: string }) =>
  (
    await request<UserResponse>('/account/email', {
      method: 'PATCH',
      body: input,
    })
  ).user;

// Also signs every other device out
export const updatePassword = (input: {
  currentPassword: string;
  newPassword: string;
}) => request<void>('/account/password', { method: 'PATCH', body: input });

export const deleteAccount = (password: string) =>
  request<void>('/account', { method: 'DELETE', body: { password } });

// Readers by @username or name
export const searchReaders = async (query: string) =>
  (
    await request<{ readers: Reader[] }>(
      `/users/search?q=${encodeURIComponent(query)}`,
    )
  ).readers;
