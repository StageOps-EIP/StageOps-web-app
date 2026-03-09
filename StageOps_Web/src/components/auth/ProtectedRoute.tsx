import { Navigate, Outlet, useLocation } from 'react-router';

function isAuthenticated(): boolean {
  // Mock auth: check for token in localStorage.
  // When backend is ready, replace with JWT validation.
  return !!localStorage.getItem('stageops-token');
}

export function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
