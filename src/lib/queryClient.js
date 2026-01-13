import { QueryClient, QueryCache } from '@tanstack/react-query';
import { clearAuth } from '../utils/authUtils';

/**
 * Global error handler for React Query
 * Handles 401 errors by clearing auth and redirecting to login
 */
function handleQueryError(error) {
  if (error?.status === 401) {
    console.warn('[QueryClient] 401 Unauthorized - clearing auth');
    clearAuth();
    // Redirect to login - will be picked up by route guards
    window.location.href = '/login';
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
        // Don't retry 401 errors
        if (error?.status === 401) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry 401 or 4xx errors
        if (error?.status === 401 || (error?.status >= 400 && error?.status < 500)) {
          return false;
        }
        return failureCount < 1;
      },
      // Global error handler for mutations
      onError: handleQueryError,
    },
  },
});
