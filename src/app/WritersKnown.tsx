import { Outlet } from 'react-router';
import { useSameWriters } from '@/entities/book/sameWriters';

// The signed-in pages, the writers on the reader's shelves known as one
// however their names are written (useSameWriters); what's worked out of
// writers worked out again as more of that's known (useWritersKnown)
export function WritersKnown() {
  useSameWriters();
  return <Outlet />;
}
