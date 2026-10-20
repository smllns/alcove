import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Fresh for a minute: moving between pages shows cached data instantly
      staleTime: 60 * 1000,
      // Retrying a 4xx won't help; a dropped connection might
      retry: (count, error) =>
        count < 2 &&
        !(error instanceof ApiError && error.status < 500 && error.status > 0),
      refetchOnWindowFocus: false,
    },
  },
});
