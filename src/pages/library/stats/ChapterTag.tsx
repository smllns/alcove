import { SectionTag } from '@/shared/ui/drawing/SectionTag';

// A chapter's number as the contents and the pill give it: in a ring, as
// the chapter's own heading does (Chapter)
export function ChapterTag({ number }: { number: number }) {
  return <SectionTag className='self-center font-sans'>{number}</SectionTag>;
}
