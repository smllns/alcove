import { Outlet, ScrollRestoration } from 'react-router';

// Around every page: a new page opens at its top, and going back returns
// to where the reader was
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
