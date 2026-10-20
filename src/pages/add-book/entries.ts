import { COLLAPSE_MS } from '@/shared/ui/Collapse';

// Lists the reader can add to, kept beside the text fields. Each entry has
// an id, so it keeps its place (and its animation) as others come and go;
// a removed one is `leaving` while it folds away.
export type TextEntry = { id: number; text: string; leaving?: boolean };
export type LinkEntry = {
  id: number;
  label: string;
  url: string;
  leaving?: boolean;
};
export type DraftLists = {
  quotes: TextEntry[];
  notes: TextEntry[];
  links: LinkEntry[];
};

let lastEntryId = 0;
export const entryId = () => ++lastEntryId;

export const emptyLists: DraftLists = { quotes: [], notes: [], links: [] };

// Each entry with its place among those staying, which is how errors from
// the server count them; -1 for one on its way out
export const numbered = <T extends { leaving?: boolean }>(entries: T[]) => {
  let place = 0;
  return entries.map((entry) => ({
    entry,
    place: entry.leaving ? -1 : place++,
  }));
};

// Removing an entry folds it away first, then drops it
export function foldAway<T extends { id: number; leaving?: boolean }>(
  update: (change: (entries: T[]) => T[]) => void,
  id: number,
) {
  update((entries) =>
    entries.map((e) => (e.id === id ? { ...e, leaving: true } : e)),
  );
  window.setTimeout(
    () => update((entries) => entries.filter((e) => e.id !== id)),
    COLLAPSE_MS,
  );
}

// The lists as they'll be saved: no blank entries, none on their way out.
// The form tidies its own lists the same way before saving, so an error
// about the second link points at the second one it shows.
const tidyText = (entries: TextEntry[]) =>
  entries.filter((entry) => !entry.leaving && entry.text.trim());

export const tidyLists = ({
  quotes,
  notes,
  links,
}: DraftLists): DraftLists => ({
  quotes: tidyText(quotes),
  notes: tidyText(notes),
  // A name with no address to go with it has nothing to link to
  links: links.filter((link) => !link.leaving && link.url.trim()),
});
