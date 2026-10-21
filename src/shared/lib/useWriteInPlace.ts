import { useState } from 'react';

// A piece of text written right on the page: what's in the box while it's
// being written (null when it isn't), a way to start (from the text as it
// is, or from something else to begin with), and what's done when the
// writing ends. Kept only if it changed; left empty, it's gone (undefined).
// Abandoned (null), nothing changes.
export function useWriteInPlace(
  current: string | undefined,
  keep: (text: string | undefined) => void,
) {
  const [writing, setWriting] = useState<string | null>(null);
  return {
    writing,
    start: (from = current ?? '') => setWriting(from),
    done: (text: string | null) => {
      setWriting(null);
      if (text === null) return;
      const kept = text.trim();
      if (kept !== (current ?? '')) keep(kept || undefined);
    },
  };
}
