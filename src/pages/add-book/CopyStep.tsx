import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { CopyCondition, ReadingState } from '@/entities/book/types';
import { PlacePicker } from '@/features/places';
import { Button } from '@/shared/ui/Button';
import { Choices } from '@/shared/ui/Choices';
import { TextArea } from '@/shared/ui/TextArea';
import type { DraftForm } from './AddBookForm';
import { placeOf, withPlace } from './draft';
import type { DraftLists } from './entries';
import { LinkEntries } from './LinkEntries';
import { LoanFields } from './LoanFields';
import { TextEntries } from './TextEntries';

type CopyStepProps = {
  form: DraftForm;
  lists: DraftLists;
  onListsChange: (update: (lists: DraftLists) => DraftLists) => void;
  saving: boolean;
  // The duplicate question or any other problem, above the buttons
  notice: ReactNode;
  onBack: () => void;
};

const readingStates: { value: ReadingState; label: string }[] = [
  { value: 'read', label: 'Read it' },
  { value: 'reading', label: 'Reading now' },
  { value: 'unread', label: 'Not yet' },
];

const conditions: { value: CopyCondition; label: string }[] = [
  { value: 'new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'worn', label: 'Well-read' },
  { value: 'battered', label: 'Falling apart' },
];

// Step two: this particular copy. Whether it's been read, where it lives,
// who has it, what shape it's in, and what the reader makes of it. All of
// it optional.
export function CopyStep({
  form,
  lists,
  onListsChange,
  saving,
  notice,
  onBack,
}: CopyStepProps) {
  const setList =
    <K extends keyof DraftLists>(name: K) =>
    (update: (entries: DraftLists[K]) => DraftLists[K]) =>
      onListsChange((l) => ({ ...l, [name]: update(l[name]) }));

  return (
    <div className='flex flex-col gap-8'>
      <Choices
        label='Have you read it?'
        options={readingStates}
        value={form.values['copy.reading']}
        onChange={(reading) => form.setValue('copy.reading', reading)}
        clearable
      />

      <PlacePicker
        value={placeOf(form.values)}
        onChange={(place) => form.setValues((v) => withPlace(v, place))}
      />

      <LoanFields form={form} />

      <Choices
        label='Condition'
        options={conditions}
        value={form.values['copy.condition']}
        onChange={(condition) => form.setValue('copy.condition', condition)}
        clearable
      />

      <TextArea
        label='Review'
        placeholder='What did you make of it? As short or as long as you like.'
        {...form.field('copy.review')}
      />

      <TextEntries
        form={form}
        name='notes'
        entries={lists.notes}
        onChange={setList('notes')}
        label='Note'
        placeholder='Something worth saying about it. It reminded me of Anna the whole way through. Reading it felt like floating above the clouds.'
        addFirst='Add a note'
        addMore='Another note'
      />

      <TextEntries
        form={form}
        name='quotes'
        entries={lists.quotes}
        onChange={setList('quotes')}
        label='Quote'
        placeholder='A line worth keeping'
        addFirst='Add a quote'
        addMore='Another quote'
      />

      <LinkEntries
        form={form}
        entries={lists.links}
        onChange={setList('links')}
      />

      {notice}
      <div className='flex flex-wrap items-center gap-3'>
        <Button type='submit' arrow loading={saving}>
          Add to library
        </Button>
        <Button variant='pill' onClick={onBack}>
          <ArrowLeft size={15} />
          The book
        </Button>
      </div>
    </div>
  );
}
