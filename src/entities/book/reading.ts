import type { ReadingState } from './types';

// Where the reader is with a book, each in a colour of its own (theme.css):
// how it's asked in the form (`label`), how it's shown on the book
// (`badge`), and the colour both carry
export const readingStates: {
  value: ReadingState;
  label: string;
  badge: string;
  tone: string;
}[] = [
  {
    value: 'read',
    label: 'Read it',
    badge: 'Read',
    tone: 'var(--read)',
  },
  {
    value: 'reading',
    label: 'Reading now',
    badge: 'Reading now',
    tone: 'var(--reading)',
  },
  {
    value: 'unread',
    label: 'Not yet',
    badge: 'Not read yet',
    tone: 'var(--unread)',
  },
];

export const readingState = (state: ReadingState) =>
  readingStates.find((s) => s.value === state)!;
