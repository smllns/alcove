import { describe, expect, it } from 'vitest';
import { api, signUp } from './api.js';
import { stubOpenLibrary, stubWikimedia } from './sites.js';

stubOpenLibrary();

// Wikipedia as it stands in for the tests: the Russian one knows two
// writers, one with an English article, one with only a German one; the
// German one knows nobody by searching
const search = (pages: unknown[]) => Response.json({ query: { pages } });
const summary = (extract: string, page: string) =>
  Response.json({
    type: 'standard',
    extract,
    content_urls: { desktop: { page } },
  });
stubWikimedia((url) => {
  const lang = url.hostname.split('.')[0];
  const q = url.searchParams;
  if (q.get('generator') === 'search') {
    if (lang !== 'ru') return search([]);
    if (q.get('gsrsearch')?.includes('Алёхина'))
      return search([
        {
          title: 'Алёхина, Мария Владимировна',
          index: 1,
          langlinks: [{ lang: 'en', title: 'Maria Alyokhina' }],
        },
      ]);
    if (q.get('gsrsearch')?.includes('Иванов'))
      return search([{ title: 'Иванов, Пётр', index: 1 }]);
    return search([]);
  }
  if (q.get('prop') === 'langlinks' && q.get('lllang') === 'de')
    return Response.json({
      query: { pages: [{ langlinks: [{ title: 'Pjotr Iwanow' }] }] },
    });
  const title = decodeURIComponent(url.pathname.split('/').pop() ?? '');
  if (title === 'Maria_Alyokhina')
    return summary('An English article.', 'https://en.wikipedia.org/x');
  if (title === 'Pjotr_Iwanow')
    return summary('Ein deutscher Artikel.', 'https://de.wikipedia.org/y');
  if (title.startsWith('Иванов'))
    return summary('Русская статья.', 'https://ru.wikipedia.org/z');
  return undefined;
});

const writer = (cookie: string, params: Record<string, string>) =>
  api(`/lookup/writer?${new URLSearchParams(params)}`, { cookie });

// Wikipedia is asked at its own pace, a couple of times a second
describe('who wrote a book the catalogue doesn’t have', () => {
  it('finds them in the languages read and written in', async () => {
    const { cookie } = await signUp();

    // Read in German, written in Russian: not found in German, found in
    // Russian, told of in English, which has them
    const english = await writer(cookie, {
      name: 'Мария Алёхина',
      title: 'Tage des Aufstands',
      original_title: 'Riot Days',
      read: 'de',
      original: 'ru',
    });
    expect(english.body.author).toMatchObject({
      name: 'Мария Алёхина',
      bio: 'An English article.',
      bioLanguage: 'en',
    });

    // Found only in Russian, with no English article: told of in German,
    // the language it was read in
    const german = await writer(cookie, {
      name: 'Пётр Иванов',
      title: 'Ein Buch',
      read: 'de',
      original: 'ru',
    });
    expect(german.body.author).toMatchObject({
      bio: 'Ein deutscher Artikel.',
      bioLanguage: 'de',
    });

    // Read in Russian: the Russian article itself will do
    const russian = await writer(cookie, {
      name: 'Пётр Иванов',
      title: 'Книга',
      read: 'ru',
    });
    expect(russian.body.author).toMatchObject({
      bio: 'Русская статья.',
      bioLanguage: 'ru',
    });

    // Nobody anywhere
    const nobody = await writer(cookie, { name: 'Nobody', title: 'Nothing' });
    expect(nobody.body.author).toBeNull();
  }, 20000);
});
