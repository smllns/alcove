import { useEffect, useState } from 'react';

// Something kept a while (word of a change, with its undo, say): gone on
// its own `ms` after it's set, or sooner when set to null
export function useBriefly<T>(ms: number) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    if (value === null) return;
    const done = window.setTimeout(() => setValue(null), ms);
    return () => window.clearTimeout(done);
  }, [value, ms]);
  return [value, setValue] as const;
}
