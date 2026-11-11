import { describe, expect, it } from 'vitest';
import { callName, type User } from './types';

const user = (
  name: string | null,
  username: string | null,
): Pick<User, 'name' | 'username'> => ({ name, username });

describe('what a reader is called', () => {
  it('is their name if they gave one, else their @username', () => {
    expect(callName(user('Marusya', 'marusya'))).toBe('Marusya');
    expect(callName(user(null, 'marusya'))).toBe('@marusya');
  });

  it('is nothing for no one', () => {
    expect(callName(null)).toBe('');
    expect(callName(user(null, null))).toBe('');
  });
});
