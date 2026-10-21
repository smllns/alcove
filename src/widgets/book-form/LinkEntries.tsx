import { Collapse } from '@/shared/ui/Collapse';
import { AddButton, RemoveButton } from '@/shared/ui/ListControls';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './BookForm';
import { entryId, foldAway, numbered, type LinkEntry } from './entries';

type LinkEntriesProps = {
  form: DraftForm;
  entries: LinkEntry[];
  onChange: (update: (entries: LinkEntry[]) => LinkEntry[]) => void;
};

// Links to go with the book, each a name and an address. TextEntries'
// sibling for pairs instead of passages.
export function LinkEntries({ form, entries, onChange }: LinkEntriesProps) {
  const rows = numbered(entries);
  const live = rows.some((row) => row.place >= 0);

  const remove = (id: number) => {
    foldAway(onChange, id);
    form.clearErrorsUnder('copy.links.');
  };

  return (
    <div>
      {rows.map(({ entry, place }, i) => {
        const edit = (field: 'label' | 'url', value: string) => {
          onChange((list) =>
            list.map((x) => (x.id === entry.id ? { ...x, [field]: value } : x)),
          );
          form.clearError(`copy.links.${place}.${field}`);
        };
        return (
          <Collapse key={entry.id} open={!entry.leaving} appear>
            <div className='grid gap-4 pb-6 sm:grid-cols-[2fr_3fr] sm:gap-6'>
              <TextField
                label={`Link ${i + 1}`}
                placeholder='Spotify playlist'
                value={entry.label}
                error={form.errors[`copy.links.${place}.label`]}
                onChange={(e) => edit('label', e.target.value)}
              />
              <TextField
                type='url'
                label='Address'
                placeholder='https://'
                value={entry.url}
                error={form.errors[`copy.links.${place}.url`]}
                onChange={(e) => edit('url', e.target.value)}
                trailing={
                  <RemoveButton
                    onClick={() => remove(entry.id)}
                    label='Remove link'
                  />
                }
              />
            </div>
          </Collapse>
        );
      })}
      <AddButton
        onClick={() =>
          onChange((list) => [...list, { id: entryId(), label: '', url: '' }])
        }
      >
        {live ? 'Another link' : 'Add a link: Goodreads, a playlist, a review'}
      </AddButton>
    </div>
  );
}
