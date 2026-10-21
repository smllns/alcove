import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';
import { paths } from '@/shared/config/paths';

// Route wrappers. While the session check is in flight they render nothing,
// so a signed-in reader never sees the login form flash.

// Signed-in only; guests go to /login and come back here afterwards
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return null;
  if (status === 'guest')
    return (
      <Navigate to={paths.login} replace state={{ from: location.pathname }} />
    );
  return <Outlet />;
}

// Guests only; someone already signed in goes straight to their library.
// A guest who signs in here is left to the form, which knows where they're
// headed (a new reader to the welcome page, not the library).
export function GuestOnly() {
  const { status } = useAuth();
  const [wasGuest, setWasGuest] = useState(false);
  if (status === 'guest' && !wasGuest) setWasGuest(true);
  if (status === 'loading') return null;
  if (status === 'signed-in' && !wasGuest)
    return <Navigate to={paths.library} replace />;
  return <Outlet />;
}
