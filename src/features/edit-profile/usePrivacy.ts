import { useState } from 'react';
import { updatePrivacy } from '@/entities/user/api';
import type { Privacy, User } from '@/entities/user/types';
import { useUserChange } from '@/features/auth';

// Who may open the reader's page and who sees each part of it, each
// changed with a tap and saved at once: shown as chosen meanwhile, and as
// it was again if it didn't save, saying why
export function usePrivacy(user: User) {
  const { error, run } = useUserChange('That didn’t save.');
  const [pending, setPending] = useState<Partial<Privacy>>({});
  const change = async (next: Partial<Privacy>) => {
    setPending((was) => ({ ...was, ...next }));
    await run(() => updatePrivacy(next));
    setPending((was) => {
      const left = { ...was };
      for (const key of Object.keys(next)) delete left[key as keyof Privacy];
      return left;
    });
  };
  return { privacy: { ...user.privacy, ...pending }, change, error };
}
