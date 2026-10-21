import { useSearchParams } from 'react-router';

// What the reader is searching their shelves for. Kept in the address
// (?q=…), so it survives a reload and the back button. The books are all
// at hand, so it searches as they type: `query` is the text, trimmed.
export function useShelfSearch() {
  const [params, setParams] = useSearchParams();
  const text = params.get('q') ?? '';

  const setText = (next: string) =>
    setParams(
      (current) => {
        if (next) current.set('q', next);
        else current.delete('q');
        return current;
      },
      // Typing stays where the reader is on the page
      { replace: true, preventScrollReset: true },
    );

  return { text, setText, query: text.trim() };
}

// Takes the search out of the address the reader will come back to, as
// they open a book, so coming back shows the whole shelf again. Only the
// browser's record of the page changes; the shelf on screen stays as it
// is while it goes.
export function forgetSearch() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('q')) return;
  url.searchParams.delete('q');
  window.history.replaceState(window.history.state, '', url);
}
