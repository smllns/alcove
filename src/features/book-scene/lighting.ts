import type { Theme } from '@/shared/theme';

// How deep the invisible wall behind the books stands, catching their
// shadows
export const WALL_DEPTH = -2.4;

// Daylight on paper, or a reading lamp in a dark room
export const LIGHTING: Record<
  Theme,
  {
    env: number;
    ambient: number;
    key: number;
    keyColor: string;
    shadow: string;
    shadowOpacity: number;
    dust: {
      color: string;
      opacity: number;
      size: number;
      speed: number;
      noise: number;
    };
  }
> = {
  light: {
    env: 1,
    ambient: 0.55,
    key: 1.9,
    keyColor: '#fff4e2',
    shadow: '#4a3a24',
    shadowOpacity: 0.13,
    dust: { color: '#a8875a', opacity: 0.5, size: 2.6, speed: 0.1, noise: 0.4 },
  },
  dark: {
    env: 0.6,
    ambient: 0.28,
    key: 2.3,
    keyColor: '#fff0dc',
    shadow: '#050302',
    shadowOpacity: 0.72,
    dust: { color: '#e6d6bd', opacity: 0.7, size: 2.4, speed: 0.25, noise: 1 },
  },
};
