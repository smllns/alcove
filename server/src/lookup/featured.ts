import { HttpError } from '../lib/errors.js';
import { cachedStale } from './cache.js';
import { classics } from './classics.js';
import { fromOpenLibrary, toWork, type SearchDoc } from './openLibrary.js';
import { worksByKeys } from './worksByKeys.js';

// Lists shown to every reader under their own: what's being read on Open
// Library this week, and the classic lists (classics.ts)
export const featured = [
  { id: 'popular', name: 'Popular this week' },
  ...classics.map(({ id, name }) => ({ id, name })),
];

// What's said of each under its name, as it's opened: written here, not
// asked of Open Library
const about: Record<string, string> = {
  popular:
    'What readers on Open Library are opening most this week, fresh every day.',
  'time-100':
    'The hundred best novels written in English since 1923, the year Time began, as its critics Lev Grossman and Richard Lacayo chose them in 2005.',
  booker:
    'Winners of the Booker Prize, given each year since 1969 to a novel written in English and published in the UK or Ireland.',
  pulitzer:
    'Winners of the Pulitzer Prize for Fiction, given since 1918 to distinguished fiction by an American author.',
};

// What's being read most on Open Library this week
async function popular() {
  const { works } = await fromOpenLibrary<{ works: SearchDoc[] }>(
    '/trending/weekly.json?limit=60',
  );
  return works.map(toWork);
}

// What's read most this week, as last asked for: fresh for a day, and
// past that given at once while a fresh one's asked for behind it
const thisWeek = () => cachedStale('popular1', 1, popular);

// One featured list with its books and what's said of it: this week's fresh for a day, a classic
// one for a month, and past that the one kept still given at once while a
// fresh one's asked for behind it, so only the very first ask waits
export async function featuredList(id: string) {
  const list = featured.find((each) => each.id === id);
  if (!list) throw new HttpError(404, 'not_found', 'No such list.');
  const works =
    id === 'popular'
      ? await thisWeek()
      : await cachedStale(`classic1:${id}`, 30, () =>
          worksByKeys(classics.find((each) => each.id === id)!.works),
        );
  return { ...list, description: about[id], works };
}

// Those of them a book is in, each with how many books it holds: the
// classics as they're kept here, this week's as it was last asked for
export async function featuredWith(workKey: string) {
  const week = await thisWeek();
  return [
    ...(week.some((work) => work.workKey === workKey)
      ? [{ ...featured[0], books: week.length }]
      : []),
    ...classics
      .filter((list) => list.works.includes(workKey))
      .map(({ id, name, works }) => ({ id, name, books: works.length })),
  ];
}
