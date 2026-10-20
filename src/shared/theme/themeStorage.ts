import { readStored, store } from '@/shared/lib/storage';

export type Theme = 'light' | 'dark';

// Keep in sync with the inline script in index.html, which applies the saved
// theme before first paint.
const THEME_KEY = 'alcove-theme';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark';

export function loadSavedTheme(): Theme | null {
  const saved = readStored(THEME_KEY);
  return isTheme(saved) ? saved : null;
}

export const saveTheme = (theme: Theme) => store(THEME_KEY, theme);

export const systemThemeQuery = () =>
  window.matchMedia('(prefers-color-scheme: dark)');

// The theme index.html already put on <html>
export const currentDocumentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
