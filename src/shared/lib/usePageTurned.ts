import { useEffect, useState } from 'react';
import { turnEnded } from './stillWhileTurning';

// Whether the page has finished turning to what's showing: false till the
// page turn it came in on is done (true almost at once with none), for
// something to wait to start until then
export function usePageTurned() {
  const [turned, setTurned] = useState(false);
  useEffect(() => {
    let gone = false;
    void turnEnded().then(() => {
      if (!gone) setTurned(true);
    });
    return () => {
      gone = true;
    };
  }, []);
  return turned;
}
