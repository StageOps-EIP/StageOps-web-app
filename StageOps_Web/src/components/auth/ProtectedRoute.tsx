import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/contexts/auth.context';

export function ProtectedRoute() {
  const location = useLocation();
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
