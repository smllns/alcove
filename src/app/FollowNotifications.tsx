import { useEffect } from 'react';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';

// A notification tapped while alcove is open (public/sw.js): the page it
// tells of opened here, as a link to it would open it
export function FollowNotifications() {
  const navigate = useTransitionNavigate();
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (e: MessageEvent<{ goTo?: string }>) => {
      const to = e.data?.goTo;
      if (to?.startsWith('/')) void navigate(to);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [navigate]);
  return null;
}
