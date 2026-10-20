import { RemoveButton } from '@/shared/ui/ListControls';
import { Reveal } from '@/shared/ui/Reveal';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './AddBookForm';

// Which series the book belongs to, and which book of it this is
export function SeriesFields({ form }: { form: DraftForm }) {
  return (
    <Reveal
      addLabel='Part of a series'
      initiallyOpen={Boolean(form.values['series.name'])}
      onRemove={() =>
        form.setValues((v) => ({
          ...v,
          'series.name': '',
          'series.number': '',
        }))
      }
    >
      {(remove) => (
        <div className='grid grid-cols-[1fr_6rem] gap-6 sm:grid-cols-[1fr_8rem]'>
          <TextField
            label='Series'
            placeholder='The Lord of the Rings'
            {...form.field('series.name')}
          />
          <TextField
            label='Book'
            placeholder='1'
            inputMode='decimal'
            trailing={<RemoveButton onClick={remove} label='Not a series' />}
            {...form.field('series.number')}
          />
        </div>
      )}
    </Reveal>
  );
}
