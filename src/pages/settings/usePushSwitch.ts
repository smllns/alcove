import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  deviceSubscription,
  fetchPushKey,
  needsHomeScreen,
  pushSupported,
  turnPushOff,
  turnPushOn,
} from '@/entities/user/push';
import { errorText } from '@/shared/lib/errorText';

// Where notifications stand on this device: not set up on the server
// (`off-here`), to be had only from the home screen (an iPhone in a tab),
// not in this browser at all, blocked in its settings, or off or on; and
// turning them on or off, with what went wrong
export type PushState =
  | 'checking'
  | 'off-here'
  | 'home-screen'
  | 'unsupported'
  | 'blocked'
  | 'off'
  | 'on';

export function usePushSwitch() {
  const key = useQuery({
    queryKey: ['push-key'],
    queryFn: fetchPushKey,
    staleTime: Infinity,
  });
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let left = false;
    deviceSubscription()
      .then((subscription) => !left && setOn(Boolean(subscription)))
      .catch(() => !left && setOn(false));
    return () => {
      left = true;
    };
  }, []);

  const state = stateOf(key.isSuccess ? key.data : undefined, on);

  const turn = async (want: boolean) => {
    setBusy(true);
    setError('');
    try {
      if (want) setOn(await turnPushOn(key.data!));
      else {
        await turnPushOff();
        setOn(false);
      }
    } catch (err) {
      setError(errorText(err, 'That didn’t work. Try again?'));
    } finally {
      setBusy(false);
    }
  };
  return { state, busy, error, turn };
}

// Where they stand, by the server's key (undefined while it's asked for,
// null when there's none) and whether this device takes them (null while
// that's looked up)
function stateOf(
  key: string | null | undefined,
  on: boolean | null,
): PushState {
  if (key === undefined) return 'checking';
  if (!key) return 'off-here';
  if (needsHomeScreen()) return 'home-screen';
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (on === null) return 'checking';
  return on ? 'on' : 'off';
}
