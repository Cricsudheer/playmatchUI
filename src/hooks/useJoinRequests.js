/**
 * React Query hooks for Join Requests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyJoinRequests,
  getPendingJoinRequests,
  submitJoinRequest,
  cancelJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  bulkApproveRequests,
  bulkRejectRequests,
} from '../api/joinRequests.api';
import { createLogger } from '../utils/logger';

const log = createLogger('JoinRequests');

// ============================================
// QUERY KEYS
// ============================================
export const joinRequestKeys = {
  all: ['joinRequests'],
  myRequests: () => [...joinRequestKeys.all, 'my'],
  pendingForTeam: (teamId) => [...joinRequestKeys.all, 'pending', teamId],
};

// ============================================
// PLAYER HOOKS
// ============================================

/**
 * Hook to fetch current user's join requests
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useMyJoinRequests(options = {}) {
  return useQuery({
    queryKey: joinRequestKeys.myRequests(),
    queryFn: async () => {
      const data = await getMyJoinRequests();
      // API returns array directly
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to submit a join request
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useSubmitJoinRequest(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, message }) => submitJoinRequest(teamId, message),
    onMutate: async ({ teamId, teamName, message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: joinRequestKeys.myRequests() });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData(joinRequestKeys.myRequests());

      // Optimistically add the new request
      queryClient.setQueryData(joinRequestKeys.myRequests(), (old = []) => [
        {
          id: `temp-${Date.now()}`,
          teamId,
          teamName: teamName || 'Unknown Team',
          userId: null,
          userName: null,
          requestStatus: 'PENDING',
          requestMessage: message,
          requestedAt: new Date().toISOString(),
          respondedAt: null,
          respondedByUserId: null,
          responseMessage: null,
        },
        ...old,
      ]);

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(joinRequestKeys.myRequests(), context.previousRequests);
      }
      log.error('Failed to submit join request', err);
    },
    onSuccess: (data) => {
      log.info('Join request submitted', { requestId: data?.id });
    },
    onSettled: () => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.myRequests() });
    },
    ...options,
  });
}

/**
 * Hook to cancel a join request
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useCancelJoinRequest(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId) => cancelJoinRequest(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: joinRequestKeys.myRequests() });

      const previousRequests = queryClient.getQueryData(joinRequestKeys.myRequests());

      // Optimistically remove or mark as cancelled
      queryClient.setQueryData(joinRequestKeys.myRequests(), (old = []) =>
        old.map((req) =>
          req.id === requestId
            ? { ...req, requestStatus: 'CANCELLED' }
            : req
        )
      );

      return { previousRequests };
    },
    onError: (err, requestId, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(joinRequestKeys.myRequests(), context.previousRequests);
      }
      log.error('Failed to cancel join request', err);
    },
    onSuccess: (_, requestId) => {
      log.info('Join request cancelled', { requestId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.myRequests() });
    },
    ...options,
  });
}

// ============================================
// CAPTAIN HOOKS
// ============================================

/**
 * Hook to fetch pending join requests for a team
 * @param {number} teamId - Team ID
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function usePendingJoinRequests(teamId, options = {}) {
  return useQuery({
    queryKey: joinRequestKeys.pendingForTeam(teamId),
    queryFn: async () => {
      const data = await getPendingJoinRequests(teamId);
      return data;
    },
    enabled: !!teamId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    ...options,
  });
}

/**
 * Hook to approve a join request
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useApproveJoinRequest(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestId, message }) =>
      approveJoinRequest(teamId, requestId, message),
    onMutate: async ({ teamId, requestId }) => {
      await queryClient.cancelQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });

      const previousData = queryClient.getQueryData(joinRequestKeys.pendingForTeam(teamId));

      // Optimistically remove from pending list
      queryClient.setQueryData(joinRequestKeys.pendingForTeam(teamId), (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content?.filter((req) => req.id !== requestId) || [],
          totalElements: Math.max(0, (old.totalElements || 0) - 1),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          joinRequestKeys.pendingForTeam(variables.teamId),
          context.previousData
        );
      }
      log.error('Failed to approve join request', err);
    },
    onSuccess: (_, { teamId, requestId }) => {
      log.info('Join request approved', { teamId, requestId });
      // Invalidate myTeams to update member count
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onSettled: (_, __, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });
    },
    ...options,
  });
}

/**
 * Hook to reject a join request
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useRejectJoinRequest(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestId, message }) =>
      rejectJoinRequest(teamId, requestId, message),
    onMutate: async ({ teamId, requestId }) => {
      await queryClient.cancelQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });

      const previousData = queryClient.getQueryData(joinRequestKeys.pendingForTeam(teamId));

      // Optimistically remove from pending list
      queryClient.setQueryData(joinRequestKeys.pendingForTeam(teamId), (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content?.filter((req) => req.id !== requestId) || [],
          totalElements: Math.max(0, (old.totalElements || 0) - 1),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          joinRequestKeys.pendingForTeam(variables.teamId),
          context.previousData
        );
      }
      log.error('Failed to reject join request', err);
    },
    onSuccess: (_, { teamId, requestId }) => {
      log.info('Join request rejected', { teamId, requestId });
    },
    onSettled: (_, __, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });
    },
    ...options,
  });
}

/**
 * Hook to bulk approve join requests
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useBulkApproveRequests(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestIds, message }) =>
      bulkApproveRequests(teamId, requestIds, message),
    onSuccess: (results, { teamId }) => {
      const successCount = results.filter((r) => r.success).length;
      log.info(`Bulk approved ${successCount}/${results.length} requests`);
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    ...options,
  });
}

/**
 * Hook to bulk reject join requests
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useBulkRejectRequests(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, requestIds, message }) =>
      bulkRejectRequests(teamId, requestIds, message),
    onSuccess: (results, { teamId }) => {
      const successCount = results.filter((r) => r.success).length;
      log.info(`Bulk rejected ${successCount}/${results.length} requests`);
      queryClient.invalidateQueries({ queryKey: joinRequestKeys.pendingForTeam(teamId) });
    },
    ...options,
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get pending request for a specific team (if any)
 * Useful for determining button state
 * @param {number} teamId - Team ID to check
 * @returns {Object|null} Pending request or null
 */
export function usePendingRequestForTeam(teamId) {
  const { data: myRequests } = useMyJoinRequests();
  
  if (!myRequests || !teamId) return null;
  
  return myRequests.find(
    (req) => req.teamId === teamId && req.requestStatus === 'PENDING'
  ) || null;
}

/**
 * Hook to get count of pending join requests for the current user's captain teams
 * Used for notification badge in header
 * @returns {Object} Query result with count
 */
export function usePendingRequestsCount() {
  return useQuery({
    queryKey: [...joinRequestKeys.all, 'pendingCount'],
    queryFn: async () => {
      // This endpoint would return the count of pending requests
      // across all teams where the user is ADMIN/COORDINATOR
      try {
        // For now, fetch from a dedicated endpoint or aggregate
        // We'll try to fetch from the pending requests endpoint
        const response = await fetch('/api/join-requests/pending/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (!response.ok) {
          // Fallback: return 0 if endpoint doesn't exist yet
          if (response.status === 404) {
            return 0;
          }
          throw new Error('Failed to fetch count');
        }
        
        const data = await response.json();
        return data.count || 0;
      } catch (error) {
        log.warn('Could not fetch pending requests count', error);
        return 0;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    retry: false,
  });
}

/**
 * Hook to get count of pending requests across all captain teams
 * Useful for notification badge
 * @param {Array<Object>} captainTeams - Teams where user is ADMIN/COORDINATOR
 * @returns {Object} { totalCount, byTeam: { [teamId]: count } }
 */
export function usePendingRequestsCounts(captainTeams = []) {
  const queries = captainTeams.map((team) => ({
    queryKey: joinRequestKeys.pendingForTeam(team.teamId || team.id),
    queryFn: () => getPendingJoinRequests(team.teamId || team.id),
    enabled: !!team,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  }));

  // This would need useQueries from React Query
  // For now, return a simplified version
  return {
    totalCount: 0,
    byTeam: {},
    isLoading: false,
  };
}
