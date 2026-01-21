import { QueryClient, QueryCache } from '@tanstack/react-query';

/**
 * Global error handler for React Query
 * Note: 401/403 handling (token refresh & redirect) is now done at the HTTP layer
 * This handler is for logging and any additional error handling needs
 */
function handleQueryError(error) {
  // Log errors for debugging (optional)
  if (error?.status && error.status >= 500) {
    console.error('[QueryClient] Server error:', error.message);
  }
}

/**
 * React Query Client Configuration
 * Centralized configuration for all queries and mutations
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry auth errors (handled by HTTP layer with token refresh)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry auth errors or client errors
        if (error?.status === 401 || error?.status === 403 || (error?.status >= 400 && error?.status < 500)) {
          return false;
        }
        return failureCount < 1;
      },
      // Global error handler for mutations
      onError: handleQueryError,
    },
  },
});
