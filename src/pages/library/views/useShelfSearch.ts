import { useSearchParams } from 'react-router';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';

// What the reader is searching their shelves for. Kept in the address
// (?q=…), so it survives a reload and the back button; `settled` is what
// to actually search for, once the typing pauses.
export function useShelfSearch() {
  const [params, setParams] = useSearchParams();
  const text = params.get('q') ?? '';
  const settled = useDebouncedValue(text.trim(), 250);

  const setText = (next: string) =>
    setParams(
      (current) => {
        if (next) current.set('q', next);
        else current.delete('q');
        return current;
      },
      { replace: true },
    );

  return { text, setText, settled };
}
