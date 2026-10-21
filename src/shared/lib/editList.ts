// Where an entry of a list is being written: its place, or a new one at
// the end
export type Editing = number | 'new';

// A list of texts (notes, quotes) with one written anew: `text` in
// place of the entry at `at`, or added at the end; trimmed, and gone when
// it's left empty. Null when that changes nothing.
export function editedList(list: string[], at: Editing, text: string) {
  const kept = text.trim();
  const next =
    at === 'new'
      ? kept
        ? [...list, kept]
        : list
      : kept
        ? list.with(at, kept)
        : list.filter((_, i) => i !== at);
  const same =
    next.length === list.length && next.every((entry, i) => entry === list[i]);
  return same ? null : next;
}
