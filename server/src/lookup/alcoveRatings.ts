import { books } from '../db.js';
import { strangersSee } from '../users/privacy.js';

// A book's rating as everyone gives it: the catalogue's readers' and
// alcove's together, each star counted once, so a few here don't outweigh
// thousands there, nor go unheard. alcove's counted by readers who let
// anyone see their stars only (one alone could otherwise be told from the
// rating), and never more than their sum and number.

type Stars = { sum: number; count: number };

// alcove's readers' stars for each of `workKeys`
export async function alcoveStars(workKeys: string[]) {
  if (!workKeys.length) return new Map<string, Stars>();
  const seen = await strangersSee('stars');
  const rows = await books()
    .aggregate<{ _id: string } & Stars>([
      {
        $match: {
          'openLibrary.work': { $in: workKeys },
          'copy.rating': { $gt: 0 },
          ...seen,
        },
      },
      {
        $group: {
          _id: '$openLibrary.work',
          sum: { $sum: '$copy.rating' },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();
  return new Map(rows.map(({ _id, sum, count }) => [_id, { sum, count }]));
}

// The catalogue's rating (its average and how many gave it) and alcove's
// stars as one: the average to a tenth, and how many in all, alcove's of
// them too; none from either, null
export function blended(
  theirs: { average: number; count: number } | null | undefined,
  ours: Stars | undefined,
) {
  const count = (theirs?.count ?? 0) + (ours?.count ?? 0);
  if (!count) return null;
  const sum = (theirs ? theirs.average * theirs.count : 0) + (ours?.sum ?? 0);
  return {
    average: Math.round((sum / count) * 10) / 10,
    count,
    alcove: ours?.count ?? 0,
  };
}
