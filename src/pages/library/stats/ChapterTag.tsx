import { SectionTag } from '../places/drawing/SectionTag';

// A chapter's number as the contents and the pill give it: in a ring, as
// the chapter's own heading does (Chapter), smaller
export function ChapterTag({ number }: { number: number }) {
  return (
    <SectionTag className='size-[18px]! self-center font-sans text-[9px]!'>
      {number}
    </SectionTag>
  );
}
