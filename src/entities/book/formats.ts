import type { BookFormat } from './types';

// How each format reads to the reader, in the order they're offered
export const bookFormats: { value: BookFormat; label: string }[] = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'paperback', label: 'Paperback' },
  { value: 'pocket', label: 'Pocket' },
];

export const formatLabel = (format: BookFormat) =>
  bookFormats.find((f) => f.value === format)?.label ?? format;
