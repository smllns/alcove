import { useQuery } from '@tanstack/react-query';
import { keepWhileTyping } from '@/shared/lib/keepWhileTyping';
import { searchReaders } from './api';

// Other readers by @username or name, the last ones kept showing while
// typing on. Asked for as the server reads it (no @, any case), so
// "@Ann" and "ann" are one search, and one answer kept.
export const useReaderSearch = (query: string) => {
  const plain = query.replace(/^@/, '').toLowerCase();
  return useQuery({
    queryKey: ['readers', 'search', plain],
    queryFn: () => searchReaders(plain),
    enabled: plain.length >= 1,
    placeholderData: keepWhileTyping(plain),
    staleTime: 60 * 1000,
  });
};
