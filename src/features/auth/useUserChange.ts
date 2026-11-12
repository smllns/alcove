import { useState } from 'react';
import type { User } from '@/entities/user/types';
import { errorText } from '@/shared/lib/errorText';
import { useAuth } from './useAuth';

// A change to who the reader is, saved: the reader as the server now has
// them shown everywhere, or why it didn't save (`fallback`, if it doesn't
// say)
export function useUserChange(fallback: string) {
  const { replaceUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const run = async (save: () => Promise<User>) => {
    setError(null);
    try {
      replaceUser(await save());
    } catch (err) {
      setError(errorText(err, fallback));
    }
  };
  return { error, run };
}
