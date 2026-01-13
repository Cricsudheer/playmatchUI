import { Navigate } from 'react-router-dom';
import { useMyTeams } from '../hooks/useMyTeams';
import { ROUTES } from '../constants/routes';

/**
 * Onboarding route wrapper
 * Prevents users with teams from accessing onboarding
 * Note: This route is wrapped by ProtectedRoute, so user is always authenticated
 */
export function OnboardingRoute({ children }) {
  // User is always authenticated here (wrapped by ProtectedRoute)
  const { data: myTeams, isLoading } = useMyTeams();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // User has teams - redirect to app
  if (myTeams && myTeams.length > 0) {
    return <Navigate to={ROUTES.APP.HOME} replace />;
  }

  // User has no teams - show onboarding
  return children;
}
