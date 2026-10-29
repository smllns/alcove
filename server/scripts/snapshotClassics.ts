// Takes a fresh copy of the classic lists (server/src/lookup/classics.ts)
// from their pages on Open Library, whose API won't give most lists' books
// (it fails on any list holding works). Run now and then, by hand, signed
// as the server signs its asks (OPENLIBRARY_CONTACT), first to see how many
// pages there are to fetch, then for the lot:
//   npx tsx --env-file=server/.env server/scripts/snapshotClassics.ts
//   npx prettier --write server/src/lookup/classics.ts --plan
//   npx tsx --env-file=server/.env server/scripts/snapshotClassics.ts
import { writeFile } from 'node:fs/promises';

const LISTS = [
  {
    id: 'time-100',
    name: 'Time’s 100 Best Novels',
    path: '/people/malumuscho/lists/OL157287L',
  },
  {
    id: 'booker',
    name: 'Booker Prize winners',
    path: '/people/onekyu84/lists/OL344660L',
  },
  {
    id: 'pulitzer',
    name: 'Pulitzer Prize for Fiction',
    path: '/people/michaelhagen/lists/OL28487L',
  },
];
const BASE = 'https://openlibrary.org';
const contact = process.env.OPENLIBRARY_CONTACT;
if (!contact) throw new Error('OPENLIBRARY_CONTACT isn’t set (server/.env)');
const HEADERS = { 'User-Agent': `alcove/1.0 (${contact})` };
// Only the first page of each list, to count what's to come
const plan = process.argv.includes('--plan');
const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));

// One ask of Open Library: told to slow down or turned away, everything
// stops at once; failing otherwise, asked once more, a while later
async function ask(url: string) {
  for (let tries = 0; tries < 2; tries++) {
    const res = await fetch(url, { headers: HEADERS }).catch(() => null);
    if (res?.status === 403 || res?.status === 429)
      throw new Error(`Open Library said ${res.status}: stopping`);
    if (res?.ok) return res;
    await pause(10000);
  }
  throw new Error(`${url} didn’t load`);
}

const page = async (path: string, n: number) =>
  (await ask(`${BASE}${path}?page=${n}`)).text();

// Every book on a list, in its order: works as they are, editions as the
// works they're of
async function seedsOf(path: string) {
  const seeds: string[] = [];
  for (let n = 1; ; n++) {
    const html = await page(path, n);
    const found = [
      ...html.matchAll(/data-seed-key="(\/(?:works|books)\/OL\d+[WM])"/g),
    ].map((m) => m[1]);
    const fresh = found.filter((seed) => !seeds.includes(seed));
    const total = /total-pages="(\d+)"/.exec(html)?.[1];
    const pages = Number(total ?? 1);
    if (plan) {
      const books = /(\d[\d,]*) (?:items|books|seeds)/.exec(html)?.[1];
      console.log(
        `${path}: ${total ?? 'no count of'} pages, ${fresh.length} on the first, ${books ?? '?'} in all, ${fresh.filter((seed) => seed.startsWith('/books/')).length} of them editions`,
      );
      break;
    }
    if (!fresh.length) break;
    seeds.push(...fresh);
    if (n >= pages) break;
    await pause(1500);
  }
  return seeds;
}

async function worksOf(seeds: string[]) {
  const editions = seeds.filter((seed) => seed.startsWith('/books/'));
  const workOf = new Map<string, string>();
  for (let i = 0; i < editions.length; i += 80) {
    const keys = editions.slice(i, i + 80).map((seed) => seed.split('/')[2]);
    const query = new URLSearchParams({
      q: `edition_key:(${keys.join(' OR ')})`,
      fields: 'key,edition_key',
      limit: '200',
    });
    const { docs } = (await (
      await ask(`${BASE}/search.json?${query}`)
    ).json()) as { docs: { key: string; edition_key?: string[] }[] };
    for (const doc of docs)
      for (const key of doc.edition_key ?? [])
        if (keys.includes(key)) workOf.set(`/books/${key}`, doc.key);
    await pause(1500);
  }
  const works = seeds
    .map((seed) => (seed.startsWith('/works/') ? seed : workOf.get(seed)))
    .filter((key): key is string => Boolean(key))
    .map((key) => key.replace('/works/', ''));
  return [...new Set(works)];
}

const out = [];
for (const list of LISTS) {
  const seeds = await seedsOf(list.path);
  if (plan) {
    await pause(1500);
    continue;
  }
  const works = await worksOf(seeds);
  console.log(
    `${list.name}: ${seeds.length} on the list, ${works.length} works`,
  );
  out.push({
    id: list.id,
    name: list.name,
    source: `${BASE}${list.path}`,
    works,
  });
}
const body = `// The classic lists, as Open Library had them on ${new Date().toISOString().slice(0, 10)}: their
// books' works, in their order. Taken by server/scripts/snapshotClassics.ts;
// not changed by hand.
export const classics = ${JSON.stringify(out, null, 1)};
`;
if (!plan)
  await writeFile(new URL('../src/lookup/classics.ts', import.meta.url), body);
