import { Outlet, ScrollRestoration } from 'react-router';
import { GoldGradient } from '@/shared/ui/Stars';

// Around every page: a new page opens at its top, and going back returns
// to where the reader was. The gold every star is painted with is here
// once for all of them.
export function RootLayout() {
  return (
    <>
      <GoldGradient />
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
