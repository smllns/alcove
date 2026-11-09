import { useRef, useState, type SubmitEvent } from 'react';
import { useAddBook, useUpdateBook } from '@/entities/book/queries';
import type { Book, CatalogueEdition, WantedBook } from '@/entities/book/types';
import { softSwitch } from '@/shared/lib/softSwitch';
import { useForm } from '@/shared/lib/useForm';
import { BookStep } from './BookStep';
import { CopyStep } from './CopyStep';
import { CoverPicker } from './CoverPicker';
import {
  coverChoices,
  extrasForEdition,
  keptEdition,
  savedExtras,
  withEdition,
} from './catalogue';
import {
  emptyFields,
  missingOnBookStep,
  type DraftExtras,
  type DraftFields,
} from './draft';
import { emptyLists, tidyLists, type DraftLists } from './entries';
import { FormButtons } from './FormButtons';
import { FormNotice } from './FormNotice';
import { StepHeading, type Step } from './StepHeading';
import { useErrorStep } from './useErrorStep';
import { useStepScroll } from './useStepScroll';
import { toBookInput, wantedOf } from './toBookInput';

export type DraftForm = ReturnType<typeof useForm<DraftFields>>;

type BookFormProps = {
  // Prefilled from the catalogue, or from the book being changed
  fields: Partial<DraftFields>;
  extras: DraftExtras;
  // The notes, quotes and links
  entries?: DraftLists;
  editions: CatalogueEdition[];
  // The book on the shelves being changed; left out for a new one
  editing?: Book;
  onSaved: () => void;
  // Choosing another book to add, or leaving the changes unsaved
  onBack: () => void;
  // The step it opens on
  startStep?: Step;
  // Already said to be a second copy of a book on the shelves, so adding
  // it doesn't ask again
  secondCopy?: boolean;
  // A copy of a book typed into lists by hand (typed-…), to take its place
  typed?: string;
  // Only the book, no copy, kept in a list (WantedSave)
  wanted?: WantedSave;
};

// A book kept without a copy: how it's saved, and what saving is called
export type WantedSave = {
  save: (book: WantedBook) => Promise<unknown>;
  label: string;
};

// A book in two steps: the book itself, prefilled from the catalogue and
// editable, then the reader's own copy of it. Adding goes through them in
// turn; changing a book on the shelves can save from either. A book only
// wanted (`wanted`) is the first step alone.
export function BookForm({
  fields,
  extras: initialExtras,
  entries: initialEntries = emptyLists,
  editions,
  editing,
  onSaved,
  onBack,
  startStep = 'book',
  secondCopy = false,
  typed,
  wanted,
}: BookFormProps) {
  const addBook = useAddBook();
  const updateBook = useUpdateBook();
  const [step, setStep] = useState<Step>(startStep);
  const [extras, setExtras] = useState(initialExtras);
  const [entries, setEntries] = useState<DraftLists>(initialEntries);

  // Set once the reader says yes, it's a second copy of a book they have
  const anotherCopy = useRef(secondCopy);
  const form = useForm<DraftFields>(
    { ...emptyFields, ...fields },
    async (values) => {
      const tidied = tidyLists(entries);
      setEntries(tidied);
      const input = toBookInput(
        values,
        savedExtras(editions, extras, values),
        tidied,
      );
      if (wanted) {
        await wanted.save(wantedOf(input));
      } else if (editing) {
        await updateBook.mutateAsync({
          id: editing.id,
          // Free text from before places existed, which the form no
          // longer shows, so isn't lost
          input: {
            ...input,
            copy: input.copy && {
              ...input.copy,
              location: editing.copy?.location,
            },
          },
        });
      } else {
        await addBook.mutateAsync({
          ...input,
          anotherCopy: anotherCopy.current,
          typed,
        });
      }
      onSaved();
    },
  );

  const {
    heading: stepHeading,
    form: formRef,
    switchFromBelow,
    toHeading,
  } = useStepScroll(step, Boolean(editing), setStep);
  useErrorStep(form.errors, setStep);

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    // Asked from either step (a book being changed saves from both): on
    // the first, up to its first questions; from the second, over to them
    // (useErrorStep)
    const missing = missingOnBookStep(form.values);
    if (Object.keys(missing).length) {
      form.setErrors((errors) => ({ ...errors, ...missing }));
      if (step === 'book') toHeading();
      return;
    }
    if (step === 'book' && !editing && !wanted) {
      switchFromBelow('copy');
      return;
    }
    void form.onSubmit();
  };

  const chooseEdition = (edition: CatalogueEdition | null) => {
    form.setValues((v) => withEdition(v, edition));
    setExtras((x) => extrasForEdition(x, edition));
  };

  const addAnotherCopy = () => {
    anotherCopy.current = true;
    void form.onSubmit();
  };

  // Saved, the page is on its way out (onSaved): still busy till it's gone,
  // rather than the spinner going first
  const saving = form.status === 'saving' || form.status === 'saved';
  const footer = (
    <>
      <FormNotice
        form={form}
        error={addBook.error}
        onAnotherCopy={addAnotherCopy}
      />
      <FormButtons
        step={step}
        onStep={switchFromBelow}
        editing={Boolean(editing)}
        saving={saving}
        onBack={onBack}
        only={wanted?.label}
      />
    </>
  );

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className='grid animate-rise gap-10 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-16'
    >
      <CoverPicker
        title={form.values.title}
        author={form.values.authors.split(',')[0]}
        cover={extras.cover}
        options={coverChoices(initialExtras.cover, editions)}
        onChange={(cover) => setExtras((x) => ({ ...x, cover }))}
        choosing={step === 'book'}
      />

      <div className='min-w-0'>
        <StepHeading
          ref={stepHeading}
          step={step}
          onStep={
            editing ? (next) => softSwitch(() => setStep(next)) : undefined
          }
          alone={Boolean(wanted)}
        />
        {/* One step comes in softly in place of the other */}
        <div key={step} className='soft-switch'>
          {step === 'book' ? (
            <BookStep
              form={form}
              editions={editions}
              edition={keptEdition(editions, extras, form.values)?.editionKey}
              onChooseEdition={chooseEdition}
              genres={extras.genres ?? []}
              onGenresChange={(genres) => setExtras((x) => ({ ...x, genres }))}
              workKey={extras.openLibrary?.work}
              footer={footer}
              wanted={Boolean(wanted)}
            />
          ) : (
            <CopyStep
              form={form}
              entries={entries}
              onEntriesChange={setEntries}
              lists={extras.lists ?? []}
              onListsChange={(lists) => setExtras((x) => ({ ...x, lists }))}
              footer={footer}
            />
          )}
        </div>
      </div>
    </form>
  );
}
