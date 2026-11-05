import { cn } from '@/shared/lib/cn';
import { choiceClass } from '@/shared/ui/buttonStyles';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './BookForm';
import { startingWith, useOwnAuthors } from './ownNames';

// How many of the reader's writers are offered at once
const OFFERED = 4;

// Who wrote it, several with commas between; as the last of them is typed,
// writers of the reader's own books it could be offered under the field,
// one tap writing it out in full
export function AuthorsField({ form }: { form: DraftForm }) {
  const known = useOwnAuthors();
  const parts = form.values.authors.split(',');
  const before = parts.slice(0, -1).map((part) => part.trim());
  const offered = startingWith(known, parts.at(-1) ?? '', before).slice(
    0,
    OFFERED,
  );
  const pick = (name: string) =>
    form.setValue('authors', [...before, name].join(', '));
  return (
    <div className='flex flex-col gap-3'>
      <TextField
        label='Authors'
        required
        marked
        hint='Separate several with commas.'
        {...form.field('authors')}
      />
      {offered.length > 0 && (
        <div className='flex flex-wrap gap-2 animate-fade-in'>
          {offered.map((name) => (
            <button
              key={name}
              type='button'
              onClick={() => pick(name)}
              className={cn(choiceClass(false), 'py-1.5')}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
