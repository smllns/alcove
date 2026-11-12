import { useState } from 'react';
import { Navigate } from 'react-router';
import { useNews, useNewsChange } from '@/entities/news/queries';
import { NewsText } from '@/entities/news/ui/NewsText';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { longDate } from '@/shared/lib/dates';
import { FormError } from '@/shared/ui/FormError';
import { InnerPage } from '@/shared/ui/InnerPage';
import { QuietButton } from '@/shared/ui/ListControls';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { TitledSection } from '@/shared/ui/TitledSection';
import { NewsForm } from './NewsForm';

// Where alcove's team writes its news, for every reader's feed: a new piece
// written, and those already out, each changed in its place or taken down
// (a second tap to be sure). Anyone else is sent on to the settings.
export function NewsPage() {
  const { user } = useAuth();
  const news = useNews();
  const { publish, rewrite, unpublish } = useNewsChange();
  const [editing, setEditing] = useState<string | null>(null);
  const [doomed, setDoomed] = useState<string | null>(null);
  if (user && !user.admin) return <Navigate to={paths.settings} replace />;
  return (
    <InnerPage width='md'>
      <Eyebrow rise={0}>alcove</Eyebrow>
      <PageTitle rise={80} size='sm' className='mt-3 mb-10'>
        News
      </PageTitle>
      <div className='flex flex-col gap-12'>
        <TitledSection title='Write a piece'>
          <NewsForm save={(input) => publish.mutateAsync(input)} />
        </TitledSection>
        <TitledSection title='Out now'>
          <ul className='flex flex-col divide-y divide-line/70'>
            {(news.data ?? []).map((piece) => (
              <li key={piece.id} className='py-5 first:pt-0'>
                {editing === piece.id ? (
                  <NewsForm
                    editing={piece}
                    save={async (input) => {
                      await rewrite.mutateAsync({ id: piece.id, input });
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <>
                    <p className='text-xs text-muted'>
                      {longDate(new Date(piece.at))}
                    </p>
                    <NewsText news={piece} />
                    {piece.link && (
                      <p className='mt-1 text-xs text-faint'>
                        {piece.link.label} → {piece.link.to}
                      </p>
                    )}
                    <div className='mt-3 flex gap-5'>
                      <QuietButton
                        onClick={() => setEditing(piece.id)}
                        className='text-sm'
                      >
                        Edit
                      </QuietButton>
                      <QuietButton
                        onClick={() =>
                          doomed === piece.id
                            ? unpublish.mutate(piece.id)
                            : setDoomed(piece.id)
                        }
                        className='text-sm text-danger'
                      >
                        {doomed === piece.id ? 'Take it down?' : 'Take down'}
                      </QuietButton>
                    </div>
                  </>
                )}
              </li>
            ))}
            {news.data && !news.data.length && (
              <li className='text-sm text-muted'>Nothing out yet.</li>
            )}
          </ul>
          <FormError message={unpublish.error?.message ?? null} small />
        </TitledSection>
      </div>
    </InnerPage>
  );
}
