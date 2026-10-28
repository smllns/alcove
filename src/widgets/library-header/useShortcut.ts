import { useEffect } from 'react';

// ⌘ (Ctrl, off a Mac) and `key`, pressed anywhere on the page
export function useShortcut(key: string, run: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== key || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      run();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [key, run]);
}
