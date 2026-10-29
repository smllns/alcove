import { HttpError } from '../lib/errors.js';
import { worksByKeys } from './worksByKeys.js';

// A work in short, as a search shows it (title, writers, cover, first year),
// asked for by its key: for a book's page opened straight from its address,
// with nothing handed over from the page before
export async function workSummary(workKey: string) {
  const [work] = await worksByKeys([workKey]);
  if (!work) throw new HttpError(404, 'not_found', 'No such book.');
  return work;
}
