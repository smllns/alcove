// A book's ISBN as its barcode gives it: the thirteen figures of an EAN-13
// starting 978 or 979 (a book's, not a tin of beans'), the last checking
// the rest; anything else, null
export function isbnFrom(code: string) {
  const figures = code.replace(/\D/g, '');
  if (figures.length !== 13 || !/^97[89]/.test(figures)) return null;
  const sum = [...figures.slice(0, 12)].reduce(
    (total, figure, i) => total + Number(figure) * (i % 2 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(figures[12]) ? figures : null;
}
