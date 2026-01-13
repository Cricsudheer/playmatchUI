import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMyTeams } from '../hooks/useMyTeams';
import { useTeamContext } from '../contexts/TeamContext';
import { ROUTES } from '../constants/routes';
import { useEffect } from 'react';

/**
 * Protected route wrapper
 * - Redirects to /login if not authenticated
 * - Redirects to /onboarding if requireTeam=true and user has no teams
 * - Calls ensureSelectedTeam when teams are loaded
 */
export function ProtectedRoute({ children, requireTeam = false }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Only fetch teams if authenticated
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams({
    enabled: isAuthenticated,
  });
  const { ensureSelectedTeam } = useTeamContext();
  const location = useLocation();

  // Ensure a team is selected when teams are loaded
  useEffect(() => {
    if (!teamsLoading && myTeams) {
      ensureSelectedTeam(myTeams);
    }
  }, [myTeams, teamsLoading, ensureSelectedTeam]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ returnTo: location.pathname }} replace />;
  }

  // Show loading while fetching teams (if required)
  if (requireTeam && teamsLoading) {
    return (
      <div className="loading-screen">
        <div>Loading teams...</div>
      </div>
    );
  }

  // Require team but user has none - redirect to onboarding
  if (requireTeam && myTeams && myTeams.length === 0) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  // All checks passed
  return children;
}
