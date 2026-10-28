import { Users } from 'lucide-react';
import { Drawer } from '@/shared/ui/Drawer';
import { IconDot } from '@/shared/ui/IconDot';

// What's new: from alcove itself first, and then (once there's anyone to
// follow) what the readers followed have added, finished and loved. For
// now, only the news, and a word on what's coming.
export function FeedDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title='Feed'>
      <article className='flex gap-3.5 border-b border-line/70 bg-accent/7 px-6 py-5'>
        <span className='grid size-9 shrink-0 place-items-center rounded-full bg-button font-serif text-[15px] tracking-[-0.04em] text-button-text'>
          <span>
            a<span className='text-accent'>.</span>
          </span>
        </span>
        <div className='min-w-0'>
          <p className='text-sm'>
            <b className='font-medium'>alcove</b>
            <span className='text-muted'> · news</span>
          </p>
          <h3 className='mt-1 font-serif text-lg leading-snug tracking-[-0.01em]'>
            Places is here: your books, room by room
          </h3>
          <p className='mt-1 text-sm leading-6 text-muted'>
            Draw your home, put every book on its shelf, and find any of them in
            a second.
          </p>
        </div>
      </article>
      <div className='flex flex-col items-center px-8 py-12 text-center'>
        <IconDot icon={Users} />
        <p className='mt-4 font-serif text-lg tracking-[-0.01em]'>
          Readers to follow, coming soon
        </p>
        <p className='mt-1.5 max-w-xs text-sm leading-6 text-muted'>
          Follow people whose shelves you like, and see here what they add,
          finish and love.
        </p>
      </div>
    </Drawer>
  );
}
