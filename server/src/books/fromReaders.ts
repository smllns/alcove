import { sharedAbout } from '../users/sharedBooks.js';
import type { BookInput } from './schemas.js';

// A book being added, with what alcove's readers have of its work where it
// says nothing itself (sharedAbout): the cover one gave theirs, and what
// it's about as one wrote it
export async function withShared<T extends BookInput>(input: T): Promise<T> {
  const work = input.openLibrary?.work;
  if (!work || (input.cover && input.description)) return input;
  const theirs = await sharedAbout(work);
  return {
    ...input,
    ...(!input.cover && theirs.cover && { cover: theirs.cover }),
    ...(!input.description &&
      theirs.description && { description: theirs.description }),
  };
}
