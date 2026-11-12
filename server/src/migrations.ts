import { connectDb, meta } from './db.js';
import { isDuplicateKey } from './lib/errors.js';
import { seedNews } from './news/seed.js';
import { backfillActivity } from './users/backfill.js';

// Changes to what's kept that are made once, in this order, by whichever
// server gets to each first: each claimed by its id in `meta` before it
// runs, and the claim let go of if it fails, so the next start tries again
const migrations = [
  // What readers did before the feeds, told once from their books
  { id: 'activity-from-books-3', run: backfillActivity },
  // The news alcove had before news could be written here
  { id: 'news-places-1', run: seedNews },
];

async function migrate() {
  const done = new Set(
    await meta().distinct('_id', {
      _id: { $in: migrations.map((each) => each.id) },
    }),
  );
  for (const { id, run } of migrations) {
    if (done.has(id)) continue;
    try {
      await meta().insertOne({ _id: id, at: new Date() });
    } catch (err) {
      if (isDuplicateKey(err)) continue;
      throw err;
    }
    await run().catch(async (err) => {
      await meta().deleteOne({ _id: id });
      throw err;
    });
  }
}

// The database connected, and brought up to date; a change that fails is
// told, and the server starts all the same
export async function openDb() {
  const db = await connectDb();
  await migrate().catch((err) =>
    console.error('Could not bring the database up to date:', err),
  );
  return db;
}
