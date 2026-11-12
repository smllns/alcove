import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useFeed, useMarkFeedSeen } from '@/entities/reader/queries';
import { Drawer } from '@/shared/ui/Drawer';
import { IconDot } from '@/shared/ui/IconDot';
import { Spinner } from '@/shared/ui/Spinner';
import { FeedRow } from './FeedRow';
import { NewsRow } from './NewsRow';

// What's new: what the readers followed added, began, finished and
// reviewed, and what was done for the reader (a heart on their review, a
// follow), and alcove's own news, the latest first, those new since the
// feed was last opened lit as long as it stays open (it's looked at as it
// opens). With nothing from anyone, a word on following.
export function FeedDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const feed = useFeed();
  // How many were new as it opened (or as they came, opened), kept lit
  // while it's open; adjusted as it renders, the React way
  const unread = feed.data?.unread ?? 0;
  const [lit, setLit] = useState({ open, fresh: 0 });
  if (open !== lit.open || (open && unread > lit.fresh))
    setLit({ open, fresh: open ? Math.max(unread, lit.fresh) : 0 });
  const fresh = lit.fresh;
  // Looked at: nothing new in it any more
  const { mutate } = useMarkFeedSeen();
  useEffect(() => {
    if (open && unread) mutate();
  }, [open, unread, mutate]);
  const items = feed.data?.items ?? [];
  return (
    <Drawer open={open} onClose={onClose} title='Feed'>
      {feed.isPending ? (
        <div className='grid place-items-center py-10'>
          <Spinner />
        </div>
      ) : (
        items.map((item, i) =>
          item.kind === 'news' ? (
            <NewsRow
              key={item.id}
              news={item.news}
              fresh={i < fresh}
              onGo={onClose}
            />
          ) : (
            <FeedRow
              key={item.id}
              item={item}
              fresh={i < fresh}
              onGo={onClose}
            />
          ),
        )
      )}
      {!feed.isPending && !items.length && (
        <div className='flex flex-col items-center px-8 py-12 text-center'>
          <IconDot icon={Users} />
          <p className='mt-4 font-serif text-lg tracking-[-0.01em]'>
            Nothing here yet
          </p>
          <p className='mt-1.5 max-w-xs text-sm leading-6 text-muted'>
            Follow readers whose shelves you like, and see here what they add,
            begin, finish and review.
          </p>
        </div>
      )}
    </Drawer>
  );
}
