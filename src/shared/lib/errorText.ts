// What to say of something that went wrong: what it said of itself, or
// else `fallback`
export const errorText = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;
