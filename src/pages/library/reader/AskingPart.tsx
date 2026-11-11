import type { ReaderPage } from '@/entities/reader/types';
import { useAnswer, useAsking } from '@/entities/reader/queries';
import { ReaderLine } from '@/entities/user/ui/ReaderLine';
import { paths } from '@/shared/config/paths';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { PagePart } from './PagePart';

// On the reader's own page, those asking to follow them (their page opens
// only to those they let in), each let in or turned away
export function AskingPart({ page }: { page: ReaderPage }) {
  const asking = useAsking(Boolean(page.asking));
  const answer = useAnswer();
  const readers = asking.data ?? [];
  if (!page.you || !readers.length) return null;
  return (
    <PagePart title='Asking to follow you' page={page}>
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
            <span className='flex gap-2'>
              <Button
                variant='pill'
                onClick={() =>
                  answer.mutate({ username: reader.username, yes: true })
                }
              >
                Let in
              </Button>
              <Button
                variant='pill'
                onClick={() =>
                  answer.mutate({ username: reader.username, yes: false })
                }
              >
                Turn away
              </Button>
            </span>
          </li>
        ))}
      </ul>
      <FormError
        message={answer.error?.message ?? null}
        small
        className='mt-2'
      />
    </PagePart>
  );
}
