import { Outlet } from 'react-router';
import { GoldGradient } from '@/shared/ui/Stars';
import { PageScroll } from './PageScroll';

// Around every page: each scrolls in a box of its own, opening at its top
// and found again where it was left going back (PageScroll). The gold
// every star is painted with is here once for all of them.
export function RootLayout() {
  return (
    <>
      <GoldGradient />
      <PageScroll>
        <Outlet />
      </PageScroll>
    </>
  );
}
