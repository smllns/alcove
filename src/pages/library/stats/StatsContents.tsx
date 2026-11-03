import { numeral } from '@/shared/lib/numerals';
import { labelClass } from '@/shared/ui/fieldStyles';
import { PageContents, type ContentsPart } from '@/shared/ui/PageContents';
import { ChapterTag } from './ChapterTag';
import { startsOf } from './sections';

export type ContentsSection = { title: string; parts: ContentsPart[] };

// The stats' contents, a book's in parts: each part's numeral and name over
// its chapters, numbered on from one part to the next; the chapter being
// read (`shown`) marked, and each a way down to it (`onGo`)
export function StatsContents({
  sections,
  shown,
  onGo,
}: {
  sections: ContentsSection[];
  shown: string;
  onGo: (id: string) => void;
}) {
  const starts = startsOf(sections);
  return (
    <div className='flex flex-col gap-5'>
      {sections.map(({ title, parts }, s) => {
        const from = starts[s];
        return (
          <div key={title}>
            <p className={labelClass}>
              {numeral(s)} · {title}
            </p>
            <PageContents
              label={title}
              parts={parts}
              shown={shown}
              onGo={onGo}
              number={(i) => <ChapterTag number={from + i + 1} />}
            />
          </div>
        );
      })}
    </div>
  );
}
