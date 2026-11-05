import { vi } from 'vitest';

type Site = {
  isIt: (url: URL) => boolean;
  answer: (url: URL) => Response | undefined;
};
const sites: Site[] = [];

// A site stood in for, so no test ever asks the real one: `answer` gives
// the reply to a request made to it (by its address), or nothing, for one
// it doesn't know (404); every other request goes on as asked
function stubSite(isIt: Site['isIt'], answer: Site['answer']) {
  if (!sites.length) {
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = new URL(String(input));
      const site = sites.find((each) => each.isIt(url));
      if (!site) return realFetch(input, init);
      return Promise.resolve(
        site.answer(url) ?? new Response('', { status: 404 }),
      );
    });
  }
  sites.push({ isIt, answer });
}

export const stubOpenLibrary = (
  answer: (url: URL) => Response | undefined = () => undefined,
) => stubSite((url) => url.hostname === 'openlibrary.org', answer);

// Wikipedia and Wikidata, every language of them
export const stubWikimedia = (
  answer: (url: URL) => Response | undefined = () => undefined,
) =>
  stubSite(
    (url) => /(^|\.)(wikipedia|wikidata|wikiquote)\.org$/.test(url.hostname),
    answer,
  );
