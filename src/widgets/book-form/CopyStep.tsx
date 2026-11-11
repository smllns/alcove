import type { ReactNode } from 'react';
import { copyConditions } from '@/entities/book/conditions';
import { ListPicker } from '@/features/lists';
import { PlacePicker } from '@/features/places';
import { StepSlider } from '@/shared/ui/StepSlider';
import { StarRating } from '@/shared/ui/StarRating';
import { TextArea } from '@/shared/ui/TextArea';
import { AcquiredFields } from './AcquiredFields';
import type { DraftForm } from './BookForm';
import { isNonPhysical, placeOf, withPlace } from './draft';
import type { DraftLists } from './entries';
import { LinkEntries } from './LinkEntries';
import { LoanFields } from './LoanFields';
import { ReadingFields } from './ReadingFields';
import { TextEntries } from './TextEntries';

type CopyStepProps = {
  form: DraftForm;
  // The notes, quotes and links
  entries: DraftLists;
  onEntriesChange: (update: (entries: DraftLists) => DraftLists) => void;
  // The ids of the reader's own lists the book is in
  lists: string[];
  onListsChange: (lists: string[]) => void;
  // The buttons at the bottom, and anything above them
  footer: ReactNode;
};

// Step two: this particular copy. Whether it's been read, where it lives,
// who has it, what shape it's in, and what the reader makes of it (where,
// who and what shape left out for a book not on the shelves). All of it
// optional.
export function CopyStep({
  form,
  entries,
  onEntriesChange,
  lists,
  onListsChange,
  footer,
}: CopyStepProps) {
  const setEntries =
    <K extends keyof DraftLists>(name: K) =>
    (update: (each: DraftLists[K]) => DraftLists[K]) =>
      onEntriesChange((e) => ({ ...e, [name]: update(e[name]) }));

  const physical = !isNonPhysical(form.values);
  return (
    <div className='flex flex-col gap-8'>
      <ReadingFields form={form} />

      {/* Rated, it's been read */}
      <StarRating
        label='Your rating'
        value={Number(form.values['copy.rating']) || 0}
        onChange={(rating) =>
          form.setValues((v) => ({
            ...v,
            'copy.rating': rating ? String(rating) : '',
            ...(rating && { 'copy.reading': 'read' as const }),
          }))
        }
      />

      {physical && (
        <PlacePicker
          value={placeOf(form.values)}
          onChange={(place) => form.setValues((v) => withPlace(v, place))}
        />
      )}

      <ListPicker value={lists} onChange={onListsChange} />

      <AcquiredFields form={form} />

      {physical && (
        <>
          <LoanFields form={form} />
          <StepSlider
            label='Condition'
            steps={copyConditions}
            value={form.values['copy.condition']}
            onChange={(condition) => form.setValue('copy.condition', condition)}
            clearable
          />
        </>
      )}

      <TextArea
        label='Review'
        placeholder='What did you make of it? As short or as long as you like.'
        {...form.field('copy.review')}
      />

      <TextEntries
        form={form}
        name='notes'
        entries={entries.notes}
        onChange={setEntries('notes')}
        label='Note'
        placeholder='Something worth saying about it. It reminded me of Anna the whole way through. Reading it felt like floating above the clouds.'
        addFirst='Add a note'
        addMore='Another note'
      />

      <TextEntries
        form={form}
        name='quotes'
        entries={entries.quotes}
        onChange={setEntries('quotes')}
        label='Quote'
        placeholder='A line worth keeping'
        addFirst='Add a quote'
        addMore='Another quote'
      />

      <LinkEntries
        form={form}
        entries={entries.links}
        onChange={setEntries('links')}
      />

      {footer}
    </div>
  );
}
