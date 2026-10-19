import { createBrowserRouter } from 'react-router';
import { GuestOnly, RequireAuth } from '@/features/auth';
import { AuthPage } from '@/pages/auth/AuthPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  {
    element: <GuestOnly />,
    children: [
      {
        // One screen for both: it stays mounted and changes in place
        element: <AuthPage />,
        children: [{ path: '/login' }, { path: '/register' }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/library', element: <LibraryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
