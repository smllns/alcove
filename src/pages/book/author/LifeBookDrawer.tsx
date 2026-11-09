import { BookCover } from '@/entities/book/ui/BookCover';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Drawer } from '@/shared/ui/Drawer';
import { Rating } from '@/shared/ui/Rating';
import { pinPage, type LifePin } from './writerBooks';

// A book tapped on the line of a writer's life, on a touch screen, shown
// in a drawer from the bottom as the stats show theirs: its cover, title,
// the year it came out, whether the reader has it and has read it, their
// stars, and the way to its page. `pin`: the last one tapped, kept as the
// drawer goes, so it doesn't empty on its way down.
export function LifeBookDrawer({
  open,
  pin,
  onClose,
}: {
  open: boolean;
  pin: LifePin | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={pin ? String(pin.year) : ''}>
      {pin && (
        <div className='flex flex-col items-center px-6 pb-8 pt-8 text-center'>
          <BookCover
            title={pin.title}
            url={pin.coverUrl}
            bookId={pin.bookId}
            className='w-36 shadow-[0_18px_30px_-16px_rgb(var(--shade)/calc(0.6*var(--shade-k)))]'
          />
          <p className='mt-6 font-serif text-2xl leading-tight text-balance text-ink'>
            {pin.title}
          </p>
          <p className='mt-2 text-sm text-muted'>
            {pin.read
              ? 'Read'
              : pin.bookId
                ? 'On your shelves'
                : 'Not on your shelves yet'}
          </p>
          {pin.rating ? (
            <Rating value={pin.rating} className='mt-2 text-sm' />
          ) : null}
          <ButtonLink {...pinPage(pin)} variant='pill' className='mt-7'>
            Open the book
          </ButtonLink>
        </div>
      )}
    </Drawer>
  );
}
