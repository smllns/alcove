import type { ReactNode } from 'react';
import type { ReaderPage } from '@/entities/reader/types';
import type { PagePart as Part } from '@/entities/user/types';
import { AudienceMenu } from '@/features/edit-profile';
import { TitledSection } from '@/shared/ui/TitledSection';

// One part of a reader's page under its heading. On their own page, a
// chip at the end of the heading says who sees it, and changes it
// (AudienceMenu); one only they see says so, as does `note`, under the
// heading. Pointed at, it rises over the parts after it, so a card it
// opens (a month's books, say) is solid over them.
export function PagePart({
  title,
  part,
  page,
  note,
  children,
}: {
  title: string;
  // Who sees it goes by this part's say; none, by the page's own
  part?: Part;
  page: ReaderPage;
  // Said of it to the reader alone, under its heading
  note?: string;
  children: ReactNode;
}) {
  const audience = part && page.privacy?.[part];
  const said =
    audience === 'me' ? 'Hidden from others: only you see this part.' : note;
  return (
    <TitledSection
      title={title}
      className='relative animate-rise hover:z-10'
      aside={part && audience && <AudienceMenu part={part} />}
    >
      {said && <p className='-mt-3 mb-5 text-[0.8125rem] text-faint'>{said}</p>}
      {children}
    </TitledSection>
  );
}
