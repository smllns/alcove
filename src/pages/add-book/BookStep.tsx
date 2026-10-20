import { bookFormats } from '@/entities/book/formats';
import type { CatalogueEdition } from '@/entities/book/types';
import { Button } from '@/shared/ui/Button';
import { Choices } from '@/shared/ui/Choices';
import { RemoveButton } from '@/shared/ui/ListControls';
import { Reveal } from '@/shared/ui/Reveal';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './AddBookForm';
import { EditionSelect } from './EditionSelect';
import { GenrePicker } from './GenrePicker';
import { LanguageFields } from './LanguageFields';
import { SeriesFields } from './SeriesFields';

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

      <Reveal
        addLabel='Add a subtitle'
        initiallyOpen={Boolean(form.values.subtitle)}
        onRemove={() => form.setValue('subtitle', '')}
      >
        {(remove) => (
          <TextField
            label='Subtitle'
            hint='The line after the title, like “A Brief History of Humankind” for Sapiens.'
            trailing={<RemoveButton onClick={remove} label='Remove subtitle' />}
            {...form.field('subtitle')}
          />
        )}
      </Reveal>

      <TextField
        label='Authors'
        required
        marked
        hint='Separate several with commas.'
        {...form.field('authors')}
      />
      <SeriesFields form={form} />
      {/* When the book first came out, then this particular printing */}
      <div className='grid gap-6 sm:grid-cols-2'>
        <TextField
          label='First published'
          inputMode='numeric'
          placeholder='1992'
          hint='The year it first came out, in any edition.'
          {...form.field('firstPublishedYear')}
        />
        <TextField
          label='This edition'
          inputMode='numeric'
          placeholder='2004'
          hint='The year your copy was printed.'
          {...form.field('publishedYear')}
        />
        <TextField label='ISBN' inputMode='numeric' {...form.field('isbn')} />
        <TextField label='Publisher' {...form.field('publisher')} />
        <TextField label='Pages' inputMode='numeric' {...form.field('pages')} />
      </div>

      <Choices
        label='Format'
        options={bookFormats}
        value={form.values.format}
        onChange={(format) => form.setValue('format', format)}
        clearable
      />

      <LanguageFields form={form} />

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
