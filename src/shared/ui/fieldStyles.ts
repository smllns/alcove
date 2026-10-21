// Small text to type in, but never under 16px on a phone: smaller, and an
// iPhone zooms the page in on the field as it's focused, and stays zoomed
// once it's left
export const smallInputText = 'text-base sm:text-sm';

// The small spaced-out caps every field is labelled with
export const labelClass = 'text-[10px] uppercase tracking-[0.24em] text-muted';

// The same caps a touch larger and darker, for labelling what's shown
// rather than asked (where a book lives, what shape it's in, a date in
// its story), read at a glance
export const captionClass =
  'text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft';
