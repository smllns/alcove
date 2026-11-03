import { useEffect, useState } from 'react';

// `value` as it's to be shown now. Changed under the same `key` (more of
// it come in, say), at once; changed with a new `key` (another choice),
// only once what was shown has faded out (`fading`, for the one showing
// it to fade it, taking `outMs`), for the new to fade in after it, never
// showing through each other.
export function useFadeSwap<T>(value: T, key: string, outMs: number) {
  const [shown, setShown] = useState({ value, key });
  const fading = shown.key !== key;
  if (!fading && shown.value !== value) setShown({ value, key });
  useEffect(() => {
    if (!fading) return;
    const done = window.setTimeout(() => setShown({ value, key }), outMs);
    return () => window.clearTimeout(done);
  }, [fading, value, key, outMs]);
  return [shown.value, fading] as const;
}
