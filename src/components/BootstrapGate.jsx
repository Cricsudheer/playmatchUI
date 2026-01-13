import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMyTeams } from '../hooks/useMyTeams';
import { useTeamContext } from '../contexts/TeamContext';
import { createLogger } from '../utils/logger';

const log = createLogger('BootstrapGate');

/**
 * Bootstrap Gate Component
 *
 * Handles app initialization and routing logic:
 * 1. Waits for auth to be determined
 * 2. If authenticated, waits for myTeams query
 * 3. Ensures a valid team is selected
 * 4. Routes user to appropriate page
 *
 * This prevents race conditions and redirect loops by ensuring
 * all critical data is loaded before routing decisions are made.
 */
export function BootstrapGate({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only fetch teams if user is authenticated AND auth check is complete
  const shouldFetchTeams = !authLoading && isAuthenticated;

  const { data: myTeams, isLoading: teamsLoading, error: teamsError } = useMyTeams({
    enabled: shouldFetchTeams,
  });
  const { ensureSelectedTeam } = useTeamContext();

  // Log bootstrap state (DEV only)
  log.debug('Bootstrap state', {
    isAuthenticated,
    authLoading,
    shouldFetchTeams,
    teamsLoading,
    hasError: !!teamsError,
  });

  // Ensure selected team is set when teams data loads
  useEffect(() => {
    if (!teamsLoading && myTeams && isAuthenticated) {
      ensureSelectedTeam(myTeams);
    }
  }, [myTeams, teamsLoading, ensureSelectedTeam, isAuthenticated]);

  // Handle 401 errors on myTeams fetch
  useEffect(() => {
    if (teamsError?.status === 401) {
      // Auth token is invalid - handled by useMyTeams onError
      // Just show the loading screen while redirect happens
    }
  }, [teamsError]);

  // Loading states
  const isBootstrapping = authLoading || (isAuthenticated && teamsLoading);

  if (isBootstrapping) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <div className="loading-text">
          {authLoading ? 'Initializing...' : 'Loading your teams...'}
        </div>
      </div>
    );
  }

  // All data loaded - render children
  // Route guards will handle specific routing logic
  return children;
}
