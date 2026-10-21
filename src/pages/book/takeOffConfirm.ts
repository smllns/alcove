// What's asked, on a touch screen, before a note or a quote is taken off
// the book
export const takeOffConfirm = (what: 'note' | 'quote') => ({
  title: `Take this ${what} off?`,
  message: `This ${what} will be gone from the book.`,
  confirmLabel: 'Take it off',
});
