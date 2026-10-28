import { readStored, store } from '@/shared/lib/storage';

export type Theme = 'light' | 'dark';
// What the reader chose: one of them, or whichever their device is in
export type ThemeChoice = Theme | 'system';

// Keep in sync with the inline script in index.html, which applies the saved
// theme before first paint (and the device's, for anything else stored).
const THEME_KEY = 'alcove-theme';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark';

export function loadSavedChoice(): ThemeChoice {
  const saved = readStored(THEME_KEY);
  return isTheme(saved) ? saved : 'system';
}

export const saveChoice = (choice: ThemeChoice) => store(THEME_KEY, choice);

export const systemThemeQuery = () =>
  window.matchMedia('(prefers-color-scheme: dark)');

// The device's theme now
export const systemTheme = (): Theme =>
  systemThemeQuery().matches ? 'dark' : 'light';

// The theme index.html already put on <html>
export const currentDocumentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
