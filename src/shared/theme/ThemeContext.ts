import { createContext } from 'react';
import type { Theme, ThemeChoice } from './themeStorage';

type ThemeContextValue = {
  // The one showing
  theme: Theme;
  // What the reader chose: a theme, or their device's
  choice: ThemeChoice;
  // `origin` is where the circular reveal starts, usually what was pressed
  choose: (choice: ThemeChoice, origin?: HTMLElement) => void;
  // Over to the other one, as the reader's choice from then on
  toggleTheme: (origin?: HTMLElement) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
