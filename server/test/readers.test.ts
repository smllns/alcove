import { describe, expect, it } from 'vitest';
import { api, fresh, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// Open Library knows none of the books here
stubOpenLibrary((url) =>
  url.pathname === '/search.json' ? Response.json({ docs: [] }) : undefined,
);

// A reader with three books: one being read, one read this year with stars
// and a quote, one waiting; and a public list and a private one
async function withBooks() {
  const anna = await signUp();
  const year = new Date().getFullYear();
  const add = (book: object) =>
    api('/books', { method: 'POST', cookie: anna.cookie, body: book });
  await add({
    title: 'Reading',
    authors: ['A'],
    copy: { status: 'shelf', reading: 'reading', started: `${year}-01-02` },
  });
  await add({
    title: 'Read',
    authors: ['B'],
    openLibrary: { work: 'OL1W' },
    copy: {
      status: 'shelf',
      reading: 'read',
      finished: `${year}-02-03`,
      rating: 5,
      quotes: ['A line worth keeping.'],
    },
  });
  await add({ title: 'Waiting', authors: ['C'], copy: { status: 'shelf' } });
  const open = await api('/lists', {
    method: 'POST',
    cookie: anna.cookie,
    body: { name: 'Open' },
  });
  await api('/lists', {
    method: 'POST',
    cookie: anna.cookie,
    body: { name: 'Mine', public: false },
  });
  return { anna, listId: open.body.list.id };
}

const page = async (username: string, cookie: string) =>
  (await api(`/users/readers/${username}`, { cookie })).body.reader;

describe('a reader’s page', () => {
  it('shows another reader only what the usual privacy lets them see', async () => {
    const { anna } = await withBooks();
    const me = await signUp();
    const seen = await page(anna.username, me.cookie);
    expect(seen.you).toBe(false);
    expect(seen.shows).toEqual({
      books: true,
      reading: true,
      stars: true,
      year: false,
      quotes: false,
    });
    expect(seen.privacy).toBeUndefined();
    expect(seen.counts).toMatchObject({ books: 3, followers: 0 });
    const read = seen.books.find((b: { title: string }) => b.title === 'Read');
    // Its stars, but not that it was read nor its quote
    expect(read).toMatchObject({ workKey: 'OL1W', rating: 5 });
    expect(read.reading).toBeUndefined();
    expect(read.quotes).toBeUndefined();
    expect(
      seen.books.find((b: { title: string }) => b.title === 'Reading'),
    ).toMatchObject({ reading: 'reading' });
    expect(seen.lists.map((l: { name: string }) => l.name)).toEqual(['Open']);
  });

  it('shows the reader themself everything, with who sees what', async () => {
    const { anna } = await withBooks();
    const own = await page(anna.username, anna.cookie);
    expect(own.you).toBe(true);
    expect(own.privacy).toMatchObject({ page: 'open', quotes: 'me' });
    const read = own.books.find((b: { title: string }) => b.title === 'Read');
    expect(read).toMatchObject({
      reading: 'read',
      quotes: ['A line worth keeping.'],
    });
  });

  it('keeps hidden books out, but what’s being read in, if that’s seen', async () => {
    const { anna } = await withBooks();
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { books: 'me', stars: 'me' },
    });
    const me = await signUp();
    const seen = await page(anna.username, me.cookie);
    expect(seen.counts.books).toBeNull();
    expect(seen.books.map((b: { title: string }) => b.title)).toEqual([
      'Reading',
    ]);
  });

  it('opens a page to be asked for only once its reader says yes', async () => {
    const { anna } = await withBooks();
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { page: 'ask', year: 'followers' },
    });
    const me = await signUp();
    const closed = await page(anna.username, me.cookie);
    expect(closed).toMatchObject({ open: false, books: [], lists: [] });
    expect(
      (
        await api(`/users/readers/${anna.username}/followers`, {
          cookie: me.cookie,
        })
      ).status,
    ).toBe(403);

    const asked = await api(`/users/readers/${anna.username}/follow`, {
      method: 'POST',
      cookie: me.cookie,
    });
    expect(asked.body.follow).toBe('asked');
    expect((await page(anna.username, anna.cookie)).asking).toBe(1);
    expect(
      (await api('/users/asking', { cookie: anna.cookie })).body.readers,
    ).toEqual([{ username: me.username, name: null, avatarUrl: null }]);

    await api(`/users/asking/${me.username}`, {
      method: 'POST',
      cookie: anna.cookie,
      body: { yes: true },
    });
    const opened = await page(anna.username, me.cookie);
    expect(opened).toMatchObject({ open: true, follow: 'following' });
    // A follower sees the year
    expect(opened.shows.year).toBe(true);
    expect(opened.counts).toMatchObject({ followers: 1 });
    const mine = await page(me.username, me.cookie);
    expect(mine.counts.following).toBe(1);
  });

  it('follows an open page at once, and no longer', async () => {
    const { anna } = await withBooks();
    const me = await signUp();
    const at = `/users/readers/${anna.username}/follow`;
    expect(
      (await api(at, { method: 'POST', cookie: me.cookie })).body.follow,
    ).toBe('following');
    expect(
      (
        await api(`/users/readers/${anna.username}/followers`, {
          cookie: me.cookie,
        })
      ).body.readers,
    ).toEqual([{ username: me.username, name: null, avatarUrl: null }]);
    expect((await page(me.username, anna.cookie)).followsYou).toBe(true);
    expect((await page(anna.username, me.cookie)).follow).toBe('following');
    await api(at, { method: 'DELETE', cookie: me.cookie });
    expect((await page(anna.username, me.cookie)).counts.followers).toBe(0);
  });

  it('can’t follow oneself, and has no page for no one', async () => {
    const me = await signUp();
    expect(
      (
        await api(`/users/readers/${me.username}/follow`, {
          method: 'POST',
          cookie: me.cookie,
        })
      ).status,
    ).toBe(400);
    expect(
      (await api('/users/readers/nobody_here_x', { cookie: me.cookie })).status,
    ).toBe(404);
  });
});

describe('a reader’s photo', () => {
  it('takes only the reader’s own upload, and can be taken away', async () => {
    const me = await signUp();
    const elsewhere = await api('/account/avatar', {
      method: 'PATCH',
      cookie: me.cookie,
      body: { url: 'https://example.com/me.jpg' },
    });
    expect(elsewhere.status).toBe(400);
    const gone = await api('/account/avatar', {
      method: 'PATCH',
      cookie: me.cookie,
      body: { url: null },
    });
    expect(gone.body.user.avatarUrl).toBeNull();
  });
});

describe('another reader’s book the catalogue doesn’t know', () => {
  it('shows what’s said of the book, nothing of their copy, if they let it be seen', async () => {
    const anna = await signUp();
    const added = await api('/books', {
      method: 'POST',
      cookie: anna.cookie,
      body: {
        title: 'Samizdat',
        authors: ['Someone'],
        description: 'Typed out at night.',
        pages: 120,
        copy: { status: 'shelf', rating: 4, notes: ['Mine alone.'] },
      },
    });
    const id = added.body.book.id;
    const me = await signUp();
    const work = (await api(`/users/books/${id}`, { cookie: me.cookie })).body
      .work;
    expect(work).toMatchObject({
      workKey: `book-${id}`,
      title: 'Samizdat',
      details: { description: 'Typed out at night.', pages: 120 },
    });
    expect(JSON.stringify(work)).not.toContain('Mine alone');
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { books: 'me' },
    });
    expect(
      (await api(`/users/books/${id}`, { cookie: me.cookie })).status,
    ).toBe(404);
  });
});

describe('books only alcove’s readers have', () => {
  it('finds a writer’s and a search’s among other readers’, but not hidden ones', async () => {
    const word = fresh('zz').replace(/[^a-z]/g, '');
    const anna = await signUp();
    const hidden = await signUp();
    const asked = await signUp();
    const me = await signUp();
    const add = (cookie: string, title: string) =>
      api('/books', {
        method: 'POST',
        cookie,
        body: {
          title,
          authors: [`Ivan ${word}`],
          description: 'Only here.',
          copy: { status: 'shelf', rating: 5 },
        },
      });
    await add(anna.cookie, 'Shared Book');
    await add(anna.cookie, 'Shared book');
    await add(hidden.cookie, 'Hidden Book');
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: hidden.cookie,
      body: { books: 'me' },
    });
    // A page to be asked for hides its books from strangers, whoever its
    // books are for
    await add(asked.cookie, 'Asked Book');
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: asked.cookie,
      body: { page: 'ask' },
    });
    await add(me.cookie, 'My Own');

    const byWriter = (
      await api(`/users/books-by?name=${encodeURIComponent(`Ivan ${word}`)}`, {
        cookie: me.cookie,
      })
    ).body.works;
    expect(byWriter.map((w: { title: string }) => w.title)).toEqual([
      'Shared Book',
    ]);

    const found = (await api(`/lookup/search?q=${word}`, { cookie: me.cookie }))
      .body.results;
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      title: 'Shared Book',
      details: { description: 'Only here.' },
    });
    expect(JSON.stringify(found)).not.toContain('rating');
  });
});

describe('a reader’s favourite books', () => {
  it('keeps up to four of their own, in order, shown as their books are', async () => {
    const { anna } = await withBooks();
    const own = (await page(anna.username, anna.cookie)).books as {
      id: string;
      title: string;
    }[];
    const [first, second] = own;
    const other = await signUp();
    const theirs = await api('/books', {
      method: 'POST',
      cookie: other.cookie,
      body: { title: 'Not hers', authors: ['X'], copy: { status: 'shelf' } },
    });
    const set = (books: string[]) =>
      api('/account/favourites', {
        method: 'PATCH',
        cookie: anna.cookie,
        body: { books },
      });
    expect((await set([first.id, theirs.body.book.id])).status).toBe(400);
    expect((await set([first.id, first.id])).status).toBe(400);
    const saved = await set([second.id, first.id]);
    expect(saved.body.user.favourites).toEqual([second.id, first.id]);

    const me = await signUp();
    const seen = await page(anna.username, me.cookie);
    expect(seen.favourites.map((b: { title: string }) => b.title)).toEqual([
      second.title,
      first.title,
    ]);
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: anna.cookie,
      body: { books: 'me' },
    });
    expect((await page(anna.username, me.cookie)).favourites).toEqual([]);
  });
});

describe('reviews of a book', () => {
  it('shows other readers’ reviews to everyone, as far as their privacy lets', async () => {
    const word = fresh('rv').replace(/[^a-z]/g, '');
    const review = (cookie: string, text: string, extra: object = {}) =>
      api('/books', {
        method: 'POST',
        cookie,
        body: {
          title: `Book ${word}`,
          authors: [`Ann ${word}`],
          ...extra,
          copy: { status: 'shelf', rating: 4, review: text },
        },
      });
    const anna = await signUp();
    const quiet = await signUp();
    const hidden = await signUp();
    const me = await signUp();
    await review(anna.cookie, 'Loved every page.');
    await review(quiet.cookie, 'Worth a slow read.');
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: quiet.cookie,
      body: { stars: 'me' },
    });
    await review(hidden.cookie, 'Not for strangers.');
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: hidden.cookie,
      body: { page: 'ask' },
    });
    await review(me.cookie, 'My own.');
    const found = (
      await api(
        `/users/reviews?title=${encodeURIComponent(`Book ${word}`)}&author=${encodeURIComponent(`Ann ${word}`)}`,
        { cookie: me.cookie },
      )
    ).body.reviews as { review: string; rating?: number }[];
    expect(found.map((each) => each.review).sort()).toEqual([
      'Loved every page.',
      'Worth a slow read.',
    ]);
    expect(
      found.find((each) => each.review === 'Loved every page.')?.rating,
    ).toBe(4);
    expect(
      found.find((each) => each.review === 'Worth a slow read.')?.rating,
    ).toBeUndefined();

    // Hearts: the one liked goes first, once however often it's liked
    const ask = async () =>
      (
        await api(
          `/users/reviews?title=${encodeURIComponent(`Book ${word}`)}&author=${encodeURIComponent(`Ann ${word}`)}`,
          { cookie: me.cookie },
        )
      ).body.reviews as {
        id: string;
        review: string;
        likes: number;
        liked: boolean;
      }[];
    const slow = found.find(
      (each) => each.review === 'Worth a slow read.',
    ) as unknown as { id: string };
    const like = (on: boolean) =>
      api(`/users/reviews/${slow.id}/like`, {
        method: on ? 'POST' : 'DELETE',
        cookie: me.cookie,
      });
    expect((await like(true)).status).toBe(204);
    await like(true);
    const liked = await ask();
    expect(liked[0]).toMatchObject({
      review: 'Worth a slow read.',
      likes: 1,
      liked: true,
    });
    // Its writer sees who gave it
    const hearts = await api(`/users/reviews/${slow.id}/hearts`, {
      cookie: quiet.cookie,
    });
    expect(hearts.body).toMatchObject({
      likes: 1,
      readers: [{ username: me.username }],
    });
    // Nobody else's
    expect(
      (await api(`/users/reviews/${slow.id}/hearts`, { cookie: me.cookie }))
        .body.likes,
    ).toBe(0);
    await like(false);
    expect((await ask()).every((each) => each.likes === 0)).toBe(true);
  });
});

describe('what a book is about', () => {
  it('is what a reader of alcove wrote, with their cover, where the catalogue says nothing', async () => {
    const work = `OL${Date.now() % 100000000}W`;
    const anna = await signUp();
    await api('/books', {
      method: 'POST',
      cookie: anna.cookie,
      body: {
        title: 'Described here',
        authors: ['Someone'],
        description: 'A house by the sea, and who keeps its light.',
        cover: {
          url: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
          source: 'openlibrary',
        },
        openLibrary: { work },
        copy: { status: 'shelf' },
      },
    });
    const me = await signUp();
    const about = (await api(`/lookup/works/${work}`, { cookie: me.cookie }))
      .body;
    expect(about).toMatchObject({
      description: 'A house by the sea, and who keeps its light.',
      from: 'readers',
      readersCover: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
    });
    // A copy of it added with neither takes both
    const added = await api('/books', {
      method: 'POST',
      cookie: me.cookie,
      body: {
        title: 'Described here',
        authors: ['Someone'],
        openLibrary: { work },
        copy: { status: 'shelf' },
      },
    });
    expect(added.body.book).toMatchObject({
      description: 'A house by the sea, and who keeps its light.',
      cover: { url: 'https://covers.openlibrary.org/b/id/12345-L.jpg' },
    });
  });
});
