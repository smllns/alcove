import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';

// Route wrappers. While the session check is in flight they render nothing,
// so a signed-in reader never sees the login form flash.

// Signed-in only; guests go to /login and come back here afterwards
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return null;
  if (status === 'guest')
    return <Navigate to='/login' replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Guests only; someone already signed in goes straight to their library
export function GuestOnly() {
  const { status } = useAuth();
  if (status === 'loading') return null;
  if (status === 'signed-in') return <Navigate to='/library' replace />;
  return <Outlet />;
}
