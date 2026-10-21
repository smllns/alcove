import { ApiError } from '@/shared/api/http';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { FormError } from '@/shared/ui/FormError';
import { PageTitle } from '@/shared/ui/PageHeading';
import { paths } from '@/shared/config/paths';

// A book that isn't there (taken off the shelves, say), or that didn't load
export function BookMissing({ error }: { error: Error }) {
  if (error instanceof ApiError && error.status === 404)
    return (
      <div className='animate-rise'>
        <PageTitle>This book isn’t on your shelves.</PageTitle>
        <ButtonLink to={paths.library} arrow className='mt-10'>
          Back to your books
        </ButtonLink>
      </div>
    );
  return (
    <FormError
      message={`The book didn’t load. ${error.message}`}
      className='py-10'
    />
  );
}
