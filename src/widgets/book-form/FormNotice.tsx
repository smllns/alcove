import { ApiError } from '@/shared/api/http';
import { FormError } from '@/shared/ui/FormError';
import { Notice } from '@/shared/ui/Notice';
import type { DraftForm } from './BookForm';
import { emptyFields } from './draft';

// Everything an error can be about and still be shown beside its field
const shownBeside = (key: string) =>
  key in emptyFields ||
  /^copy\.((quotes|notes)\.\d+|links\.\d+\.(label|url))$/.test(key);

// Above the buttons: the question asked when the book is already on the
// shelves (is this a second copy?), or else whatever went wrong that has
// no field on screen to sit beside, so it isn't missed
export function FormNotice({
  form,
  error,
  onAnotherCopy,
}: {
  form: DraftForm;
  // What adding the book last failed with
  error: unknown;
  onAnotherCopy: () => void;
}) {
  const alreadyShelved =
    error instanceof ApiError &&
    error.code === 'already_shelved' &&
    Boolean(form.formError);
  if (alreadyShelved)
    return (
      <div className='animate-rise'>
        <Notice
          title={form.formError}
          action='Add another copy'
          onAction={onAnotherCopy}
        >
          Is this a second copy? Then add it anyway.
        </Notice>
      </div>
    );

  const stray = Object.entries(form.errors)
    .filter(([key, message]) => message && !shownBeside(key))
    .map(([, message]) => message);
  return <FormError message={form.formError ?? (stray.join(' ') || null)} />;
}
