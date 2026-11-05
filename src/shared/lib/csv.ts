// A CSV file read into its rows, each a list of its cells, as a
// spreadsheet writes one: cells in double quotes may hold commas, line
// breaks and doubled quotes ("" for one); lines end in \n or \r\n.
export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') cell += char;
      else if (text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) rows.push([...row, cell]);
  // A file saved with a byte-order mark keeps it on its first cell
  if (rows[0]?.[0]) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '');
  return rows.filter((each) => each.some((value) => value.trim()));
}

// The rows after the first as records, by the first row's names
export function csvRecords(text: string) {
  const [names = [], ...rows] = parseCsv(text);
  return rows.map((row) =>
    Object.fromEntries(names.map((name, i) => [name.trim(), row[i] ?? ''])),
  );
}
