// Text without capitals or accents, as names and titles are compared:
// "Brontë" is "bronte", "Алёхина" is "алехина"
export const unaccented = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
