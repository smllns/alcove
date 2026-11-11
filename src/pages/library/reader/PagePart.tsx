import type { ReactNode } from 'react';
import { Globe, Lock, Users } from 'lucide-react';
import type { ReaderPage } from '@/entities/reader/types';
import type { Audience, PagePart as Part } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { TitledSection } from '@/shared/ui/TitledSection';
import { TransitionLink } from '@/shared/ui/TransitionLink';

const audiences: Record<Audience, { label: string; icon: ReactNode }> = {
  everyone: { label: 'Everyone', icon: <Globe size={12} /> },
  followers: { label: 'Followers', icon: <Users size={12} /> },
  me: { label: 'Only you', icon: <Lock size={12} /> },
};

// One part of a reader's page under its heading. On their own page, a
// chip at the end of the heading says who sees it, leading to where
// that's changed; one only they see says so, as does `note`, under the
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
  const shown = audience && audiences[audience];
  return (
    <TitledSection
      title={title}
      className='relative animate-rise hover:z-10'
      aside={
        shown && (
          <TransitionLink
            to={`${paths.settings}#page`}
            className='flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 text-xs text-muted transition-colors duration-500 ease-soft hover:border-ink hover:text-ink'
          >
            {shown.icon}
            {shown.label}
          </TransitionLink>
        )
      }
    >
      {said && <p className='-mt-3 mb-5 text-[0.8125rem] text-faint'>{said}</p>}
      {children}
    </TitledSection>
  );
}
