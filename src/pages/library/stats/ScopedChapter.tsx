import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { Crossfade } from '@/shared/ui/Crossfade';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { shows, type ShelfShow } from '../views/order';
import { noteClass, sayClass } from './Chapter';

// A chapter that can count only the physical books or every one, chosen over it
// as the shelves choose which books they show (only when some aren't physical):
// what it found of each (`found`; null for too few to tell), its sentence, if
// it has one, and drawing (`render`) fading across from one to the other, the
// room they take easing to fit
export function ScopedChapter<T>({
  found,
  start,
  choosing,
  render,
}: {
  found: Record<ShelfShow, T | null>;
  start: ShelfShow;
  choosing: boolean;
  render: (found: T) => { say?: ReactNode; body: ReactNode };
}) {
  const [show, setShow] = useState(start);
  return (
    <>
      {choosing && (
        <ChoiceCapsule
          label='Count'
          words
          options={shows}
          current={show}
          onChange={setShow}
          className='mt-3 w-fit'
        />
      )}
      <SmoothHeight>
        <Crossfade
          show={show}
          render={(shown) => {
            const each = found[shown];
            if (!each)
              return <p className={noteClass}>Too few books to tell.</p>;
            const { say, body } = render(each);
            return (
              <div className='pt-2.5'>
                {say && <p className={cn('mb-7', sayClass)}>{say}</p>}
                {body}
              </div>
            );
          }}
        />
      </SmoothHeight>
    </>
  );
}
