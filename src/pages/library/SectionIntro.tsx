import type { ReactNode } from 'react';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';

// What a section of the library says first, centred over what it holds:
// a small eyebrow, its title and a line or two, rising in one after the
// other
export function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col items-center text-center'>
      <Eyebrow rise={0}>{eyebrow}</Eyebrow>
      <PageTitle rise={60} className='mt-3 max-w-2xl text-balance sm:mt-4'>
        {title}
      </PageTitle>
      <Lead rise={120} className='mt-5 max-w-lg'>
        {children}
      </Lead>
    </div>
  );
}
