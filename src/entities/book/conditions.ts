import type { CopyCondition } from './types';

// The shape a copy is in, as it reads to the reader, best first, each in
// a colour of its own (theme.css)
export const copyConditions: {
  value: CopyCondition;
  label: string;
  tone: string;
}[] = [
  { value: 'new', label: 'Like new', tone: 'var(--kept-new)' },
  { value: 'good', label: 'Good', tone: 'var(--kept-good)' },
  { value: 'worn', label: 'Well-read', tone: 'var(--kept-worn)' },
  { value: 'battered', label: 'Falling apart', tone: 'var(--kept-battered)' },
];
