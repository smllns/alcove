// Wikiquote's pages are wikitext: links, templates, references, bold and
// italics all written inline. These turn one quoted line into plain text.

export function plainText(wikitext: string) {
  return (
    wikitext
      // References and comments, whole
      .replace(/<ref[^>]*\/>/gi, '')
      .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      // {{w|Name}} and the like keep their words; other templates go
      .replace(
        /\{\{\s*w\s*\|\s*([^}|]+)(?:\|([^}]+))?\}\}/gi,
        (_, a, b) => b ?? a,
      )
      .replace(/\{\{[^{}]*\}\}/g, '')
      // [[target|words]], [[words]], [http://… words]
      .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
      .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
      .replace(/\[https?:\/\/[^\]]+\]/g, '')
      // Bold and italics
      .replace(/'{2,}/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\n\s*/g, '\n')
      .trim()
  );
}

// The parts set in bold: on Wikiquote, the lines a passage is known for
export const boldParts = (wikitext: string) =>
  [...wikitext.matchAll(/'''([\s\S]+?)'''/g)].map((m) => plainText(m[1]));
