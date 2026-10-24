import { z } from 'zod';
import { HttpError } from './errors.js';

// Turns a failed zod parse into a 400 with the first problem per field
function validationError(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    fields[key] ??= issue.message;
  }
  return new HttpError(
    400,
    'validation_failed',
    'Please check the highlighted fields.',
    fields,
  );
}

// The request body, checked against `schema`, or a 400 listing what's wrong
export function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw validationError(parsed.error);
  return parsed.data;
}

// Left out, sent empty, or sent as null (the catalogue's way of saying
// "none"): all mean the same thing, nothing
export const maybe = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === null || value === '' ? undefined : value),
    schema.optional(),
  );

// The name the reader gives something of theirs (a room, a list), its
// spaces tidied: `what` it is, for asking for one
export const nameOf = (what: string) =>
  z
    .string()
    .transform((name) => name.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, `Give this ${what} a name.`)
        .max(60, 'Keep it under 60 characters.'),
    );

// Text that may be left out; empty counts as left out
export const optionalText = (max: number) =>
  maybe(
    z.string().trim().max(max, `Keep it under ${max} characters.`),
  ).transform((value) => value || undefined);

// A list that may be missing or null, without its blank entries
export const list = <T extends z.ZodType>(
  item: T,
  max: number,
  tooMany: string,
) =>
  z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value.filter(
            (entry) =>
              entry != null && (typeof entry !== 'string' || entry.trim()),
          )
        : (value ?? []),
    z.array(item).max(max, tooMany),
  );

// A calendar day, YYYY-MM-DD
const calendarDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check the date.');
export const day = maybe(calendarDay);

// The reader's today may already be tomorrow here, on the other side of
// the world
const latestToday = () =>
  new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);

// A day that has already come: when something happened
export const pastDay = maybe(
  calendarDay.refine(
    (value) => value <= latestToday(),
    'That day hasn’t come yet.',
  ),
);
