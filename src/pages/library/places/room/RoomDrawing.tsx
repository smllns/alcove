import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';
import type { RoomBooks } from '../arrange';
import type { Decor } from '../drawing/decor';
import { detailOf, tagOf } from './bookcaseTags';
import { RoomFloor } from '../drawing/RoomFloor';
import { MiniBookcase, MiniPiles } from '../drawing/RoomMiniature';
import { SectionTag } from '../drawing/SectionTag';
import { WallDecor } from '../drawing/WallDecor';

// A room opened, drawn from the front as in its home's drawing, its
// bookcases tagged with letters, each tag leading down to its bookcase's
// detail (RoomDetails)
export function RoomDrawing({
  decor,
  units,
  loose,
}: Pick<RoomBooks, 'units' | 'loose'> & {
  // What it's furnished with (decor.ts)
  decor: Decor;
}) {
  const toDetail = (id: string) => {
    const detail = document.getElementById(detailOf(id));
    if (detail)
      scrollPageTo(
        pageScrollY(detail) + detail.getBoundingClientRect().top - 112,
        'smooth',
        detail,
      );
  };
  return (
    <div className='relative mx-auto mt-8 flex w-full max-w-2xl flex-col xl:max-w-4xl'>
      {/* A little in from the ends of the floor */}
      <div className='flex flex-col px-[5%]'>
        <WallDecor decor={decor} />
        <RoomFloor
          decor={decor}
          cases={units.map((unit, i) => (
            <button
              key={unit.unit.id}
              type='button'
              onClick={() => toDetail(unit.unit.id)}
              aria-label={`${unit.unit.name}: to its shelves`}
              className='case-link group flex cursor-pointer flex-col items-center gap-2 pb-4 outline-none'
            >
              <MiniBookcase {...unit} />
              <SectionTag className='transition-colors duration-700 ease-soft group-hover:bg-ink group-hover:text-surface group-focus-visible:bg-ink group-focus-visible:text-surface'>
                {tagOf(i)}
              </SectionTag>
            </button>
          ))}
          className='mt-6 justify-center gap-8'
        >
          {loose.length > 0 && (
            <MiniPiles books={loose} grow={1.15} className='max-w-64' />
          )}
        </RoomFloor>
      </div>
      <div className='room-floor' />
    </div>
  );
}
