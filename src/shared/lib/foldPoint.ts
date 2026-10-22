type Row = { top: number; bottom: number };

// The lines a text is laid out in, top to bottom, measured from its top
function rowsOf(el: HTMLElement, lineHeight: number) {
  const top = el.getBoundingClientRect().top;
  const rows: Row[] = [];
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (!rect.width) continue;
      const row = { top: rect.top - top, bottom: rect.bottom - top };
      if (!rows.some((r) => Math.abs(r.top - row.top) < lineHeight / 2))
        rows.push(row);
    }
  }
  return rows.sort((a, b) => a.top - b.top);
}

// How tall a text folded to about its first `lines` is best shown: cut
// partway into a line its paragraph goes on to, so the line before it
// still reads and it plainly carries on under the fade, never at a
// paragraph's end, where what's shown would look finished. Nearest above
// the given number of lines, or else below.
export function foldPoint(el: HTMLElement, lines: number) {
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
  const rows = rowsOf(el, lineHeight);
  const target = lineHeight * lines;
  // The next line follows straight on, not after a blank one
  const goesOn = (i: number) =>
    i + 1 < rows.length && rows[i + 1].top - rows[i].bottom < lineHeight / 2;

  let last = -1;
  rows.forEach((row, i) => {
    if (row.bottom <= target + 1) last = i;
  });
  let at = last;
  while (at > 0 && !goesOn(at)) at--;
  if (at < 1 || !goesOn(at)) {
    at = last;
    while (at >= 0 && at < rows.length && !goesOn(at)) at++;
  }
  if (at < 0 || !goesOn(at)) return Math.round(target);
  // A little over halfway down the next line, mostly faded out
  const next = rows[at + 1];
  return Math.round(next.top + (next.bottom - next.top) * 0.6);
}
