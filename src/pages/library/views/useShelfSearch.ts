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
