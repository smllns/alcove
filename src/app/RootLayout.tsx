import { Outlet, ScrollRestoration } from 'react-router';
import { CarriedScroll, ReturnedScroll } from '@/shared/lib/carryScroll';
import { GoldGradient } from '@/shared/ui/Stars';

// Around every page: a new page opens at its top (from a page scrolled
// down, without a jump: carryScroll), and going back returns to where the
// reader was (without the window scrolling mid-way either). The gold every
// star is painted with is here once for all of them.
export function RootLayout() {
  return (
    <>
      <GoldGradient />
      <CarriedScroll />
      <Outlet />
      <ScrollRestoration />
      <ReturnedScroll />
    </>
  );
}
