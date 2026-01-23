/**
 * React Query hooks for Team Discovery
 */

import { useQuery } from '@tanstack/react-query';
import { discoverTeams, getTeamById } from '../api/discover.api';

// ============================================
// QUERY KEYS
// ============================================
export const discoverKeys = {
  all: ['discover'],
  teams: (filters) => [...discoverKeys.all, 'teams', filters],
  team: (teamId) => [...discoverKeys.all, 'team', teamId],
};

/**
 * Hook to search/browse teams
 * @param {Object} filters - Search filters
 * @param {string} [filters.name] - Team name search query
 * @param {string} [filters.city] - City filter
 * @param {number} [filters.limit=10] - Results per page
 * @param {number} [filters.offset=0] - Offset for pagination
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useDiscoverTeams(filters = {}, options = {}) {
  const { name, city, limit = 10, offset = 0 } = filters;

  return useQuery({
    queryKey: discoverKeys.teams({ name, city, limit, offset }),
    queryFn: () => discoverTeams({ name, city, limit, offset }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep old data while fetching new
    ...options,
  });
}

/**
 * Hook to get team details
 * @param {number} teamId - Team ID
 * @param {Object} options - Query options
 * @returns {Object} Query result
 */
export function useTeamDetails(teamId, options = {}) {
  return useQuery({
    queryKey: discoverKeys.team(teamId),
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
