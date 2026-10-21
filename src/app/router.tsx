import { createBrowserRouter } from 'react-router';
import { GuestOnly, RequireAuth } from '@/features/auth';
import { AddBookPage } from '@/pages/add-book/AddBookPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { BookPage } from '@/pages/book/BookPage';
import { EditBookPage } from '@/pages/book/EditBookPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { WelcomePage } from '@/pages/welcome/WelcomePage';
import { sections } from '@/widgets/library-header';
import { RootLayout } from './RootLayout';
import { paths } from '@/shared/config/paths';

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
            children: [{ path: paths.login }, { path: paths.register }],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          // One page for every section of the library, each at its own
          // address
          ...sections.map((section) => ({
            path: section.path,
            element: <LibraryPage section={section.key} />,
          })),
          { path: paths.addBook, element: <AddBookPage /> },
          { path: paths.book(':id'), element: <BookPage /> },
          { path: paths.editBook(':id'), element: <EditBookPage /> },
          { path: paths.settings, element: <SettingsPage /> },
          { path: paths.welcome, element: <WelcomePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
