import type { z } from 'zod';
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
