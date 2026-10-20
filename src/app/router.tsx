import { createBrowserRouter } from 'react-router';
import { GuestOnly, RequireAuth } from '@/features/auth';
import { AddBookPage } from '@/pages/add-book/AddBookPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { WelcomePage } from '@/pages/welcome/WelcomePage';
import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
          {
            path: '/library/places',
            element: <LibraryPage section='places' />,
          },
          { path: '/library/loans', element: <LibraryPage section='loans' /> },
          {
            path: '/library/quotes',
            element: <LibraryPage section='quotes' />,
          },
          { path: '/library/stats', element: <LibraryPage section='stats' /> },
          { path: '/library/add', element: <AddBookPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/welcome', element: <WelcomePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
