import { z } from 'zod';
import { optionalText } from '../lib/validation.js';

// Links a reader keeps with a book: a playlist, a review, a Goodreads page

const webAddress = z
  .string()
  .trim()
  .min(1, 'Paste the link here.')
  .max(500, 'That link is very long.')
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'That doesn’t look like a web link.');

// Typed without the https:// people usually leave off
const withScheme = (url: unknown) =>
  typeof url === 'string' &&
  url.trim() &&
  !/^[a-z][a-z\d+.-]*:/i.test(url.trim())
    ? `https://${url.trim()}`
    : url;

// A link with an optional name; a bare address is accepted as one too
export const webLink = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? { url: withScheme(value) }
      : value && typeof value === 'object' && 'url' in value
        ? { ...value, url: withScheme(value.url) }
        : value,
  z.object({
    label: optionalText(80),
    url: webAddress,
  }),
);
