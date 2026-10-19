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
  loadSavedTheme,
  saveTheme,
  systemThemeQuery,
  type Theme,
} from './themeStorage';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentDocumentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow the system until someone picks a theme themselves
  useEffect(() => {
    const media = systemThemeQuery();
    const onChange = (e: MediaQueryListEvent) => {
      if (!loadSavedTheme()) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(
    (origin?: HTMLElement) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      if (origin) circularReveal(origin, () => setTheme(next));
      else setTheme(next);
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
