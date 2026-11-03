import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReadingAt } from '@/shared/lib/useReadingAt';
import { counted } from '@/shared/lib/plural';
import { numeral } from '@/shared/lib/numerals';
import { labelClass } from '@/shared/ui/fieldStyles';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { Chapter } from './Chapter';
import { ChapterPill } from './ChapterPill';
import { startsOf } from './sections';
import { StatsContents } from './StatsContents';

export type Part = {
  key: string;
  title: string;
  say?: ReactNode;
  body: ReactNode;
};

// The almanac's parts, each its name and its chapters, in order
export type Section = { title: string; parts: Part[] };

// Where a chapter is, for the contents to lead to
const idOf = (key: string) => `stats-${key}`;

// Chapters short enough to stand side by side on the widest screens, when
// both are there
const PAIRS = [
  ['condition', 'publishers'],
  ['stars', 'ways'],
  ['authors', 'languages'],
];

// The stats laid out as an almanac in parts (the library, the reading, what
// the books are), each under its numeral and name: a short title, how many
// books it's of over it, then the chapters one under another, numbered on
// through the parts, short ones in pairs side by side on the widest
// screens. Beside them on a wide screen, the title and the contents stay on
// the left as the chapters go by, as the settings' do; on a phone, the
// chapter being read floats at the foot of the screen, opening the
// contents (ChapterPill). A part with no chapters to show is left out.
export function Almanac({
  sections: all,
  total,
}: {
  sections: Section[];
  total: number;
}) {
  const sections = all.filter((section) => section.parts.length);
  const keys = sections.flatMap((section) => section.parts.map((p) => p.key));
  const contents = sections.map(({ title, parts }) => ({
    title,
    parts: parts.map(({ key, title: label }) => ({ id: idOf(key), label })),
  }));
  const [shown, goTo] = useReadingAt(keys.map(idOf));
  const paired = (key: string) =>
    PAIRS.some(
      (pair) => pair.includes(key) && pair.every((one) => keys.includes(one)),
    );

  const starts = startsOf(sections);
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
          <StatsContents sections={contents} shown={shown} onGo={goTo} />
        </div>
      </div>
      <div className='grid min-w-0 gap-x-14 xl:grid-cols-2'>
        {sections.map(({ title, parts }, s) => (
          <Fragment key={title}>
            {/* The part's numeral and name, a rule running on from it */}
            <p
              className={cn(
                labelClass,
                'flex items-center gap-4 xl:col-span-2',
                s === 0 ? 'mt-10 lg:mt-0' : 'mt-24',
              )}
            >
              {numeral(s)} · {title}
              <span aria-hidden className='h-px flex-1 bg-line' />
            </p>
            {parts.map((part, i) => (
              <Chapter
                key={part.key}
                id={idOf(part.key)}
                number={starts[s] + i + 1}
                title={part.title}
                say={part.say}
                className={cn(
                  'scroll-mt-28',
                  // The first straight under the part's name, the rest
                  // ruled off from the one before
                  i === 0 ? 'mt-10' : 'mt-14 border-t border-line pt-14',
                  !paired(part.key) && 'xl:col-span-2',
                )}
              >
                {part.body}
              </Chapter>
            ))}
          </Fragment>
        ))}
      </div>
      <ChapterPill sections={contents} shown={shown} onGo={goTo} />
    </div>
  );
}
