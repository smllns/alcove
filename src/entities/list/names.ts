// A list's name as it's kept: its spaces tidied, as the server keeps it
// (server/src/lib/validation.ts nameOf)
export const tidyListName = (name: string) => name.trim().replace(/\s+/g, ' ');

// Two names the same but for capitals: "Summer reads", "summer Reads", one
// list, as the server tells them apart (server/src/lists/repository.ts)
export const sameListName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

// A name for a list just begun, to be called something else straight
// away: "New list", or "New list 2" and on while one's called that
export function freshListName(names: string[]) {
  for (let n = 1; ; n++) {
    const name = n === 1 ? 'New list' : `New list ${n}`;
    if (!names.some((each) => sameListName(each, name))) return name;
  }
}
