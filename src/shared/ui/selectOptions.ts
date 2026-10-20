// The choices in a Select, and finding one by its first letter

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  // Set apart from the choices proper, like "+ New room…"
  muted?: boolean;
};

// Typing a letter in a menu: the next option after `active` starting with
// it, else the first one; null if none does, or the key isn't a letter
export function jumpTo<T extends string>(
  options: SelectOption<T>[],
  key: string,
  active: number,
) {
  if (key.length !== 1 || !/\S/.test(key)) return null;
  const starts = (o: SelectOption<T>) =>
    o.label.toLowerCase().startsWith(key.toLowerCase());
  const next = options.findIndex((o, i) => i > active && starts(o));
  const first = options.findIndex(starts);
  return next >= 0 ? next : first >= 0 ? first : null;
}
