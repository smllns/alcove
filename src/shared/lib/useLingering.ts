import { useEffect, useState } from 'react';

// `on`, and still for `ms` once it's gone off: for something to stay on
// the page while it fades out, and only then be let go
export function useLingering(on: boolean, ms: number) {
  const [lingering, setLingering] = useState(on);
  if (on && !lingering) setLingering(true);
  useEffect(() => {
    if (on || !lingering) return;
    const done = window.setTimeout(() => setLingering(false), ms);
    return () => window.clearTimeout(done);
  }, [on, lingering, ms]);
  return lingering;
}
