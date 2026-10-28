import { useSyncExternalStore } from 'react';

// A phone's screen: narrower than Tailwind's sm
export const PHONE = '(max-width: 639px)';

// Whether a media query matches, kept up to date as it changes
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
