import type { ReaderPage } from '@/entities/reader/types';
import { useAsking } from '@/entities/reader/queries';
import { Answer } from '@/entities/reader/ui/Answer';
import { ReaderLine } from '@/entities/user/ui/ReaderLine';
import { paths } from '@/shared/config/paths';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { PagePart } from './PagePart';

// On the reader's own page, those requesting to follow them (their page
// opens only to those they let in), each accepted or declined
export function AskingPart({ page }: { page: ReaderPage }) {
  const asking = useAsking(Boolean(page.asking));
  const readers = asking.data ?? [];
  if (!page.you || !readers.length) return null;
  return (
    <PagePart title='Follow requests' page={page}>
      <ul className='flex flex-col divide-y divide-line/70'>
        {readers.map((reader) => (
          <li
            key={reader.username}
            className='flex flex-wrap items-center justify-between gap-3 py-3'
          >
            <TransitionLink
              to={paths.reader(reader.username)}
              className='flex min-w-0 items-center gap-3'
            >
              <ReaderLine reader={reader} />
            </TransitionLink>
            <Answer username={reader.username} />
          </li>
        ))}
      </ul>
    </PagePart>
  );
}
