import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { circularReveal } from './circularReveal';
import { ThemeContext } from './ThemeContext';
import {
  currentDocumentTheme,
  loadSavedChoice,
  saveChoice,
  systemTheme,
  systemThemeQuery,
  type Theme,
  type ThemeChoice,
} from './themeStorage';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentDocumentTheme);
  const [choice, setChoice] = useState<ThemeChoice>(loadSavedChoice);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Following the device, along with it as it changes (at dusk, say)
  useEffect(() => {
    if (choice !== 'system') return;
    const media = systemThemeQuery();
    const onChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [choice]);

  const choose = useCallback(
    (next: ThemeChoice, origin?: HTMLElement) => {
      saveChoice(next);
      setChoice(next);
      const shown = next === 'system' ? systemTheme() : next;
      if (shown === theme) return;
      if (origin) circularReveal(origin, () => setTheme(shown));
      else setTheme(shown);
    },
    [theme],
  );

  const toggleTheme = useCallback(
    (origin?: HTMLElement) =>
      choose(theme === 'dark' ? 'light' : 'dark', origin),
    [choose, theme],
  );

  const value = useMemo(
    () => ({ theme, choice, choose, toggleTheme }),
    [theme, choice, choose, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
