import type { ReactNode } from 'react';
import { Collapse } from '@/shared/ui/Collapse';

// A part of a book's page that comes after the page itself (from the
// catalogue, say): when it's `ready` it opens out softly to make its room,
// rather than pushing everything below it down at once. In the page's
// column of parts (gap-10), it brings its own gap along, so one that never
// comes leaves none. Already there when the page opens, it's simply there.
export function Arriving({
  ready,
  children,
}: {
  ready: boolean;
  children: ReactNode;
}) {
  return (
    <div className='-mt-10'>
      <Collapse open={ready} arriving>
        <div className='pt-10'>{ready && children}</div>
      </Collapse>
    </div>
  );
}
