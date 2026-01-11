import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getPlayerProfile } from '../services/playerProfileService';

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 * Redirects to profile creation if user doesn't have a profile
 */
export function ProtectedRoute({ children, skipProfileCheck = false }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if user has a profile (only if authenticated and not on profile page)
  useEffect(() => {
    const checkProfile = async () => {
      // Skip profile check for profile page itself, login, signup
      if (skipProfileCheck || !isAuthenticated || !user || location.pathname === '/profile') {
        setProfileLoading(false);
        setHasProfile(true); // Don't block if we're skipping the check
        return;
      }

      try {
        setProfileLoading(true);
        console.log('[ProtectedRoute] Checking if user has profile...');
        const profile = await getPlayerProfile(user.id);

        if (profile) {
          console.log('[ProtectedRoute] User has profile');
          setHasProfile(true);
        } else {
          console.log('[ProtectedRoute] User does not have profile, redirecting to profile creation');
          setHasProfile(false);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error checking profile:', error);
        // If profile check fails, assume no profile exists
        setHasProfile(false);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, user, location.pathname, skipProfileCheck]);

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated, save current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Show loading screen while checking profile
  if (profileLoading) {
    return (
      <div className="loading-screen">
        <div>Loading profile...</div>
      </div>
    );
  }

  // Redirect to profile creation if user doesn't have a profile
  if (!skipProfileCheck && !hasProfile && location.pathname !== '/profile') {
    console.log('[ProtectedRoute] Redirecting to profile creation');
    return <Navigate to="/profile" state={{ fromSignup: true }} replace />;
  }

  // User is authenticated and has profile, render children
  return children;
}
