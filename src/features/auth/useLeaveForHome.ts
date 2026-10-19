import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { runCurtain } from '@/shared/lib/curtain';
import { nextPaint } from '@/shared/lib/frames';

// Takes the reader home behind the curtain, then runs `action` (sign out,
// forget a deleted account). Home first: the page they're leaving needs a
// session, and would bounce to /login if it ended while still on screen.
export function useLeaveForHome() {
  const navigate = useNavigate();
  return useCallback(
    (action: () => unknown) =>
      runCurtain(async () => {
        await navigate('/', { replace: true });
        await nextPaint();
        await action();
      }),
    [navigate],
  );
}
