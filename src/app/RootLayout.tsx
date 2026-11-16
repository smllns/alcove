import { Outlet } from 'react-router';
import { GoldGradient } from '@/shared/ui/Stars';
import { FollowNotifications } from './FollowNotifications';
import { PageScroll } from './PageScroll';

// Around every page: each scrolls in a box of its own, opening at its top
// and found again where it was left going back (PageScroll). The gold
// every star is painted with is here once for all of them, and a
// notification tapped while the app is open leads on from here.
export function RootLayout() {
  return (
    <>
      <GoldGradient />
      <FollowNotifications />
      <PageScroll>
        <Outlet />
      </PageScroll>
    </>
  );
}
