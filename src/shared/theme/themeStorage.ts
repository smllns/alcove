export type Theme = 'light' | 'dark';

// Keep in sync with the inline script in index.html, which applies the saved
// theme before first paint.
const THEME_KEY = 'alcove-theme';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark';

export function loadSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return isTheme(saved) ? saved : null;
  } catch {
    // Storage can be blocked; the theme still works, it just isn't remembered
    return null;
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Not remembered, still switches
  }
}

export const systemThemeQuery = () =>
  window.matchMedia('(prefers-color-scheme: dark)');

// The theme index.html already put on <html>
export const currentDocumentTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
