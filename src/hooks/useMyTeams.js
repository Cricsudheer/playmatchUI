/**
 * React Query hooks for teams
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyTeams, createTeam, joinTeam } from '../api/teams.api';
import { useNavigate } from 'react-router-dom';
import { createLogger } from '../utils/logger';

const log = createLogger('Teams');

/**
 * Hook to fetch user's teams
 * Only fetches when user is authenticated
 * @param {object} options - Query options
 * @param {boolean} options.enabled - Whether to enable the query (default: true)
 * @returns {object} Query result with teams data
 */
export function useMyTeams(options = {}) {
  return useQuery({
    queryKey: ['myTeams'],
    queryFn: getMyTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options.enabled !== false, // Allow disabling the query
    // 401 handling is done globally in queryClient
  });
}

/**
 * Hook to create a team
 * Uses optimistic updates to immediately show new team in UI
 * @param {object} options - Mutation options
 * @param {function} options.onTeamCreated - Callback with (newTeam)
 * @returns {object} Mutation result
 */
export function useCreateTeam({ onTeamCreated } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    // Optimistically update the cache before the mutation completes
    onMutate: async (newTeamData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['myTeams'] });

      // Snapshot the previous value
      const previousTeams = queryClient.getQueryData(['myTeams']);

      // Return context with the snapshot
      return { previousTeams };
    },
    onSuccess: async (newTeam) => {
      log.info('Team created successfully', { teamId: newTeam.teamId || newTeam.id });

      // Invalidate and refetch to get server state
      await queryClient.invalidateQueries({ queryKey: ['myTeams'] });

      // Call the callback with the new team
      if (onTeamCreated) {
        onTeamCreated(newTeam);
      }
    },
    onError: (error, newTeamData, context) => {
      // Rollback to previous state on error
      if (context?.previousTeams) {
        queryClient.setQueryData(['myTeams'], context.previousTeams);
      }
      log.error('Failed to create team', error);
    },
  });
}

/**
 * Hook to join a team
 * @param {object} options - Mutation options
 * @param {function} options.onTeamJoined - Callback with (joinedTeam, setSelectedTeamId)
 * @returns {object} Mutation result
 */
export function useJoinTeam({ onTeamJoined } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinTeam,
    onSuccess: async (joinedTeam) => {
      log.info('Joined team successfully', { teamId: joinedTeam.teamId || joinedTeam.id });

      // Invalidate and refetch teams
      await queryClient.invalidateQueries({ queryKey: ['myTeams'] });

      // Call the callback
      if (onTeamJoined) {
        onTeamJoined(joinedTeam);
      }
    },
  });
}
