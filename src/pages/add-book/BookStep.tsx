import { useRef, useState } from 'react';
import type { CatalogueEdition } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { AddButton, RemoveButton } from '@/shared/ui/ListControls';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './AddBookForm';
import { EditionSelect } from './EditionSelect';
import { GenrePicker } from './GenrePicker';

type BookStepProps = {
  form: DraftForm;
  editions: CatalogueEdition[];
  edition?: string;
  onChooseEdition: (edition: CatalogueEdition | null) => void;
  genres: string[];
  onGenresChange: (genres: string[]) => void;
  onBack: () => void;
};

// Step one: the book itself, as the catalogue (or the reader) describes it
export function BookStep({
  form,
  editions,
  edition,
  onChooseEdition,
  genres,
  onGenresChange,
  onBack,
}: BookStepProps) {
  // Most books have none, so the field waits until there is one
  const [showSubtitle, setShowSubtitle] = useState(
    Boolean(form.values.subtitle),
  );
  const subtitleInput = useRef<HTMLInputElement>(null);

  const openSubtitle = () => {
    setShowSubtitle(true);
    // Once it's no longer inert
    requestAnimationFrame(() =>
      subtitleInput.current?.focus({ preventScroll: true }),
    );
  };
  const removeSubtitle = () => {
    setShowSubtitle(false);
    form.setValue('subtitle', '');
  };

  return (
    <div className='flex flex-col gap-6'>
      {editions.length > 0 && (
        <EditionSelect
          editions={editions}
          value={edition}
          onChange={onChooseEdition}
        />
      )}
      <TextField label='Title' required marked {...form.field('title')} />

      {/* The link sits snug under the title; the field takes a full gap */}
      <div
        className={cn(
          'transition-[margin] duration-700 ease-soft',
          !showSubtitle && '-mt-3',
        )}
      >
        <Collapse open={!showSubtitle}>
          <AddButton onClick={openSubtitle}>Add a subtitle</AddButton>
        </Collapse>
        <Collapse open={showSubtitle}>
          <TextField
            ref={subtitleInput}
            label='Subtitle'
            hint='The line after the title, like “A Brief History of Humankind” for Sapiens.'
            trailing={
              <RemoveButton onClick={removeSubtitle} label='Remove subtitle' />
            }
            {...form.field('subtitle')}
          />
        </Collapse>
      </div>

      <TextField
        label='Authors'
        required
        marked
        hint='Separate several with commas.'
        {...form.field('authors')}
      />
      <div className='grid gap-6 sm:grid-cols-2'>
        <TextField label='ISBN' inputMode='numeric' {...form.field('isbn')} />
        <TextField label='Publisher' {...form.field('publisher')} />
        <TextField
          label='Year'
          inputMode='numeric'
          {...form.field('publishedYear')}
        />
        <TextField label='Pages' inputMode='numeric' {...form.field('pages')} />
      </div>

      <GenrePicker value={genres} onChange={onGenresChange} />

      <p className='text-xs text-faint'>
        <span className='text-danger'>*</span> Title and author are all a book
        needs. Everything else can stay empty.
      </p>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Submitting this step moves on to the next */}
        <Button type='submit' arrow>
          Next: your copy
        </Button>
        <Button variant='pill' onClick={onBack}>
          Choose another book
        </Button>
      </div>
    </div>
  );
}
