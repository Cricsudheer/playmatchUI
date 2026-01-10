import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

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

  // User is authenticated, render children
  return children;
}
