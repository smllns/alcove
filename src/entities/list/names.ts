// A list's name as it's kept: its spaces tidied, as the server keeps it
// (server/src/lib/validation.ts nameOf)
export const tidyListName = (name: string) => name.trim().replace(/\s+/g, ' ');

// Two names the same but for capitals: "Summer reads", "summer Reads", one
// list, as the server tells them apart (server/src/lists/repository.ts)
export const sameListName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
