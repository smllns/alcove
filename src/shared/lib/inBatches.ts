// `items` sent a batch of `size` at a time (`send`), one after another,
// the counts each batch answers with added up; how many have gone told as
// they go (`onSent`)
export async function inBatches<T, Counts extends Record<string, number>>(
  items: T[],
  size: number,
  send: (batch: T[]) => Promise<Counts>,
  onSent: (sent: number) => void,
) {
  let total: Counts | undefined;
  for (let from = 0; from < items.length; from += size) {
    const counts = await send(items.slice(from, from + size));
    total = total
      ? (Object.fromEntries(
          Object.entries(counts).map(([key, n]) => [
            key,
            (total![key] ?? 0) + n,
          ]),
        ) as Counts)
      : counts;
    onSent(Math.min(items.length, from + size));
  }
  return total;
}
