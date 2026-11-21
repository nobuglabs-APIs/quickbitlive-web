import { QueryClient } from '@tanstack/react-query';

export const AUTO_REFRESH_INTERVAL = 1000 * 30; // 30 seconds

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: (failureCount, error: any) => {
        // Do not retry 401, 403, 404, 422 errors
        if (error?.status === 401 || error?.status === 403 || error?.status === 404 || error?.status === 422) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});
