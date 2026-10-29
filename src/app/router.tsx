import { createBrowserRouter } from 'react-router';
import { GuestOnly, RequireAuth } from '@/features/auth';
import { AddBookPage } from '@/pages/add-book/AddBookPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { BookPage } from '@/pages/book/BookPage';
import { EditBookPage } from '@/pages/book/EditBookPage';
import { WorkPage } from '@/pages/book/WorkPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { FeaturedListPage } from '@/pages/library/lists/FeaturedListPage';
import { ListPage } from '@/pages/library/lists/ListPage';
import { ReadersListPage } from '@/pages/library/lists/ReadersListPage';
import { SharedListPage } from '@/pages/library/lists/SharedListPage';
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
            handle: { page: 'auth' },
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
            handle: { page: 'library' },
          })),
          { path: paths.addBook, element: <AddBookPage /> },
          { path: paths.book(':id'), element: <BookPage /> },
          { path: paths.editBook(':id'), element: <EditBookPage /> },
          { path: paths.work(':workKey'), element: <WorkPage /> },
          { path: paths.list(':id'), element: <ListPage /> },
          { path: paths.featuredList(':id'), element: <FeaturedListPage /> },
          { path: paths.sharedList(':id'), element: <SharedListPage /> },
          {
            path: paths.readersList(':owner', ':id'),
            element: <ReadersListPage />,
          },
          { path: paths.settings, element: <SettingsPage /> },
          { path: paths.welcome, element: <WelcomePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
