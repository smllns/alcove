import { createContext } from 'react';
import type { Theme } from './themeStorage';

export type ThemeContextValue = {
  theme: Theme;
  // `origin` is where the circular reveal starts, usually the toggle button
  toggleTheme: (origin?: HTMLElement) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
