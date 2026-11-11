import { useReader } from '@/entities/reader/queries';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { ReaderView } from './ReaderView';

// The reader's own page, as other readers see it (ReaderView); one with no
// username yet chooses one first, as that's how they're found
export function ProfileSection() {
  const { user } = useAuth();
  const reader = useReader(user?.username ?? undefined);
  if (!user?.username)
    return (
      <div className='flex animate-rise flex-col items-center gap-5 py-16 text-center'>
        <p className='max-w-sm font-serif text-xl text-ink-soft'>
          Choose a username, and other readers can find your page.
        </p>
        <ButtonLink to={`${paths.settings}#profile`}>Choose one</ButtonLink>
      </div>
    );
  if (reader.isError)
    return (
      <FormError message={reader.error.message} className='py-10 text-center' />
    );
  return reader.data ? <ReaderView page={reader.data} /> : <Loading />;
}
