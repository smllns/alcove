// A word for `count` of a thing: "1 rating", "3 ratings". The plural is
// the word with an s unless it's given.
export const plural = (count: number, one: string, many = `${one}s`) =>
  count === 1 ? one : many;

// The same with the number in front: "121 ratings"
export const counted = (count: number, one: string, many?: string) =>
  `${count.toLocaleString('en')} ${plural(count, one, many)}`;
