import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary } from './sites.js';

// The catalogue's readers gave the book a 4 on average, three of them
stubOpenLibrary((url) => {
  if (url.pathname === '/works/OL700W/ratings.json')
    return Response.json({ summary: { average: 4, count: 3 } });
  if (url.pathname === '/search.json')
    return Response.json({
      docs: [
        {
          key: '/works/OL700W',
          title: 'Rated',
          ratings_average: 4,
          ratings_count: 3,
        },
      ],
    });
  return undefined;
});

const rate = (cookie: string, rating: number) =>
  api('/books', {
    method: 'POST',
    cookie,
    body: {
      title: 'Rated',
      authors: ['X'],
      openLibrary: { work: 'OL700W' },
      copy: { status: 'shelf', rating },
    },
  });

describe('a book’s rating', () => {
  it('is the catalogue’s readers’ and alcove’s together, stars someone hides left out', async () => {
    const open = await signUp();
    const quiet = await signUp();
    await rate(open.cookie, 5);
    await rate(quiet.cookie, 1);
    await api('/account/privacy', {
      method: 'PATCH',
      cookie: quiet.cookie,
      body: { stars: 'me' },
    });
    const me = await signUp();
    const { ratings } = (
      await api('/lookup/works/OL700W/ratings', { cookie: me.cookie })
    ).body;
    // (4 × 3 + 5) / 4
    expect(ratings).toEqual({ average: 4.3, count: 4, alcove: 1 });
    const { averages } = (
      await api('/lookup/averages?works=OL700W', { cookie: me.cookie })
    ).body;
    expect(averages.OL700W).toBe(4.3);
  });
});
