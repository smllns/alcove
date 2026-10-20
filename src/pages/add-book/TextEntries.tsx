import { Collapse } from '@/shared/ui/Collapse';
import { AddButton, RemoveButton } from '@/shared/ui/ListControls';
import { TextArea } from '@/shared/ui/TextArea';
import type { DraftForm } from './AddBookForm';
import { entryId, foldAway, numbered, type TextEntry } from './entries';

type TextEntriesProps = {
  form: DraftForm;
  // Which list on the server, for its errors: `copy.quotes.0`
  name: 'quotes' | 'notes';
  entries: TextEntry[];
  onChange: (update: (entries: TextEntry[]) => TextEntry[]) => void;
  // What one entry is called, e.g. "Quote", numbered as "Quote 1"
  label: string;
  placeholder: string;
  addFirst: string;
  addMore: string;
};

// A list of passages the reader adds one at a time, each as long as it needs
// to be. Entries grow into place and fold away when removed.
export function TextEntries({
  form,
  name,
  entries,
  onChange,
  label,
  placeholder,
  addFirst,
  addMore,
}: TextEntriesProps) {
  const rows = numbered(entries);
  const live = rows.some((row) => row.place >= 0);

  const remove = (id: number) => {
    foldAway(onChange, id);
    form.clearErrorsUnder(`copy.${name}.`);
  };

  return (
    <div>
      {rows.map(({ entry, place }, i) => (
        <Collapse key={entry.id} open={!entry.leaving} appear>
          <div className='pb-5'>
            <TextArea
              label={`${label} ${i + 1}`}
              placeholder={placeholder}
              value={entry.text}
              error={form.errors[`copy.${name}.${place}`]}
              onChange={(e) => {
                const text = e.target.value;
                onChange((list) =>
                  list.map((x) => (x.id === entry.id ? { ...x, text } : x)),
                );
                form.clearError(`copy.${name}.${place}`);
              }}
              action={
                <RemoveButton
                  onClick={() => remove(entry.id)}
                  label={`Remove ${label.toLowerCase()}`}
                />
              }
            />
          </div>
        </Collapse>
      ))}
      <AddButton
        onClick={() =>
          onChange((list) => [...list, { id: entryId(), text: '' }])
        }
      >
        {live ? addMore : addFirst}
      </AddButton>
    </div>
  );
}
