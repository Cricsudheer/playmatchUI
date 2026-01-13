import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useMyTeams } from '../hooks/useMyTeams';
import { ROUTES } from '../constants/routes';

/**
 * Public-only route (login, signup)
 * Redirects authenticated users to appropriate page
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  // Only fetch teams if authenticated
  const { data: myTeams, isLoading: teamsLoading } = useMyTeams({
    enabled: isAuthenticated,
  });

  // Show loading while checking auth
  if (authLoading || (isAuthenticated && teamsLoading)) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated - show public page
  if (!isAuthenticated) {
    return children;
  }

  // Authenticated - redirect based on team count
  if (myTeams && myTeams.length === 0) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return <Navigate to={ROUTES.APP.HOME} replace />;
}
