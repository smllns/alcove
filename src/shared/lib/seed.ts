// A number in [0, 1) that's always the same for the same text, for
// anything that should look picked at random but stay as it was on every
// visit (a book's height on its shelf, what's on a room's walls). Texts
// that differ by a letter (ids made one after another) land far apart.
export function seedOf(text: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x2c1b3c6d);
  hash ^= hash >>> 12;
  return (hash >>> 0) / 2 ** 32;
}
