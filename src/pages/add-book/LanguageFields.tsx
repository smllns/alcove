import { languageOptions } from '@/entities/book/languages';
import { Collapse } from '@/shared/ui/Collapse';
import { Select } from '@/shared/ui/Select';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './AddBookForm';
import { isTranslation, withLanguage } from './draft';

// The language of this edition and the one it was written in, which starts
// out the same. When they differ, it's a translation: who translated it,
// and its title in the original.
export function LanguageFields({ form }: { form: DraftForm }) {
  const { language, originalLanguage } = form.values;
  const options = languageOptions(language, originalLanguage);

  const select = (
    name: 'language' | 'originalLanguage',
    label: string,
    onChange: (code: string) => void,
  ) => (
    <Select
      label={label}
      value={form.values[name]}
      options={options}
      onChange={onChange}
      placeholder='Choose a language'
    />
  );

  return (
    <div>
      <div className='grid gap-6 sm:grid-cols-2'>
        {select('language', 'Language', (code) =>
          form.setValues((v) => withLanguage(v, code)),
        )}
        {select('originalLanguage', 'Original language', (code) =>
          form.setValue('originalLanguage', code),
        )}
      </div>
      <Collapse open={isTranslation(form.values)}>
        <div className='grid gap-6 pt-6 sm:grid-cols-2'>
          <TextField
            label='Translated by'
            hint='Separate several with commas.'
            {...form.field('translators')}
          />
          <TextField
            label='Original title'
            placeholder='As it was first published'
            {...form.field('originalTitle')}
          />
        </div>
      </Collapse>
    </div>
  );
}
