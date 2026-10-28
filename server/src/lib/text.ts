// Text without capitals or accents, as names and titles are compared:
// "Brontë" is "bronte", "Алёхина" is "алехина"
export const unaccented = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Text to look for as it is inside a regular expression, nothing in it
// read as a pattern
export const escapedForRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
