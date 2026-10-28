import type { Query } from '@tanstack/react-query';

// For a search for `query` (its text last in its key): what the last
// search found stays showing while this one loads, as long as one follows
// on from the other as it's typed (letters added, or taken off the end).
// Something else typed in afresh starts with nothing from before in it.
export const keepWhileTyping =
  (query: string) =>
  <T>(
    previous: T | undefined,
    last?: Query<T, Error, T, readonly unknown[]>,
  ) => {
    const was = String(last?.queryKey.at(-1) ?? '').toLowerCase();
    const now = query.toLowerCase();
    return was && (now.startsWith(was) || was.startsWith(now))
      ? previous
      : undefined;
  };
