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
 * 
 * MVP Configuration:
 * - No retries (fail fast for quicker debugging)
 * - Token refresh is handled at HTTP layer (single retry there)
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: false, // MVP: No retries - fail fast
      refetchOnWindowFocus: false, // MVP: Disable aggressive refetching
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // MVP: No retries - fail fast
      onError: handleQueryError,
    },
  },
});
