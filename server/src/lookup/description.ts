// What a book is about, as Open Library describes a work. Its descriptions
// are Markdown, often with a tail after a rule (the books a set contains,
// the collections it also appears in) and links to sources; only the
// description itself is kept, as plain text.

// As long as a description may be
export const DESCRIPTION_MAX = 5000;

// Cut at the last full sentence that fits
function shorten(text: string) {
  if (text.length <= DESCRIPTION_MAX) return text;
  const cut = text.slice(0, DESCRIPTION_MAX);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.\n'));
  return end > 0 ? cut.slice(0, end + 1) : cut;
}

export function cleanDescription(text: string | undefined) {
  if (!text) return undefined;
  const body = text
    .replace(/\r\n?/g, '\n')
    // Everything after a rule: contents, "Also contained in", …
    .split(/^\s*-{3,}\s*$/m)[0]
    // "([source][1])", and the addresses such references point at
    .replace(/\(\[source\]\[\d+\]\)/gi, '')
    .replace(/^\s*\[\d+\]:\s*\S+.*$/gm, '')
    // Links and bold, down to their words
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[\d+\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return body ? shorten(body) : undefined;
}
