import { useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router';
import type { ReaderPage } from '@/entities/reader/types';
import { useReader } from '@/entities/reader/queries';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { BackLink } from '@/shared/ui/BackLink';
import { BackToTop } from '@/shared/ui/BackToTop';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { pageWidthClass } from '@/shared/ui/surfaces';
import { LibraryHeader, LibraryNav } from '@/widgets/library-header';

// Around a page of another reader's, opened by their username: the
// library's header and tabs (none of them open), the way back, and what's
// drawn of them (`children`) once they're here, and once that's scrolled
// away, a way back up. The reader's own goes to `own`, their own page of
// it. `backBeside`: the way back is the page's own to place on a wide
// screen (over the photo, staying with it); here only on narrower ones.
export function ReaderFrame({
  own,
  backBeside = false,
  children,
}: {
  own: string;
  backBeside?: boolean;
  children: (page: ReaderPage) => ReactNode;
}) {
  const { username = '' } = useParams();
  const { user } = useAuth();
  const reader = useReader(username);
  // The top of the page: gone up out of sight, there's a way back up
  const [top, setTop] = useState<HTMLSpanElement | null>(null);
  if (user?.username === username) return <Navigate to={own} replace />;
  return (
    <main className='bg-paper isolate min-h-screen text-ink'>
      <LibraryHeader />
      <div className={cn('pb-24 pt-2 sm:pt-4', pageWidthClass)}>
        <LibraryNav />
        <div className='pt-8 sm:pt-10'>
          <div className={cn(backBeside && 'lg:hidden')}>
            <BackLink to={paths.library} returns />
          </div>
          <span ref={setTop} aria-hidden className='block h-px' />
          {reader.isError ? (
            <FormError
              message={reader.error.message}
              className='py-10 text-center'
            />
          ) : !reader.data ? (
            <Loading />
          ) : (
            children(reader.data)
          )}
        </div>
      </div>
      <BackToTop after={top} />
    </main>
  );
}
