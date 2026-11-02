import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReadingAt } from '@/shared/lib/useReadingAt';
import { counted } from '@/shared/lib/plural';
import { PageContents } from '@/shared/ui/PageContents';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { Chapter } from './Chapter';
import { ChapterTag } from './ChapterTag';
import { ChapterPill } from './ChapterPill';

export type Part = {
  key: string;
  title: string;
  say?: ReactNode;
  body: ReactNode;
};

// Where a chapter is, for the contents to lead to
const idOf = (key: string) => `stats-${key}`;

// The stats laid out as an almanac: a short title, how many books it's
// of over it, then its chapters one under another, the authors and the
// languages (both short) side by side on the widest screens. Beside them
// on a wide screen, the title and the contents stay on the left as the
// chapters go by, as the settings' do;
// on a phone, the chapter being read floats at the foot of the screen,
// opening the contents (ChapterPill).
export function Almanac({ parts, total }: { parts: Part[]; total: number }) {
  const contents = parts.map(({ key, title }) => ({
    id: idOf(key),
    label: title,
  }));
  const [shown, goTo] = useReadingAt(contents.map(({ id }) => id));
  const paired = (key: string) =>
    ['authors', 'languages'].every((one) =>
      parts.some((part) => part.key === one),
    ) && ['authors', 'languages'].includes(key);

  return (
    <div className='grid w-full lg:grid-cols-[15rem_1fr] lg:gap-16 xl:gap-24'>
      <div className='lg:sticky lg:top-24 lg:self-start xl:top-10'>
        <Eyebrow rise={0} className='whitespace-nowrap lg:text-[10px]'>
          Your library · {counted(total, 'book')}
        </Eyebrow>
        <PageTitle size='xs' rise={60} className='mt-2'>
          In numbers
        </PageTitle>
        <div
          className='mt-8 animate-rise max-lg:hidden'
          style={{ animationDelay: '120ms' }}
        >
          <PageContents
            label='Chapters'
            parts={contents}
            shown={shown}
            onGo={goTo}
            number={(i) => <ChapterTag number={i + 1} />}
          />
        </div>
      </div>
      <div className='grid min-w-0 gap-x-14 xl:grid-cols-2'>
        {parts.map((part, i) => (
          <Chapter
            key={part.key}
            id={idOf(part.key)}
            number={i + 1}
            title={part.title}
            say={part.say}
            className={cn(
              'scroll-mt-28',
              // The first straight under the title (beside it on a wide
              // screen), the rest ruled off from the one before
              i === 0 ? 'mt-10 lg:mt-0' : 'mt-14 border-t border-line pt-14',
              !paired(part.key) && 'xl:col-span-2',
            )}
          >
            {part.body}
          </Chapter>
        ))}
      </div>
      <ChapterPill parts={contents} shown={shown} onGo={goTo} />
    </div>
  );
}
