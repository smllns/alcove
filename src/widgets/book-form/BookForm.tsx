import { useRef, useState, type SubmitEvent } from 'react';
import { useAddBook, useUpdateBook } from '@/entities/book/queries';
import type { Book, CatalogueEdition } from '@/entities/book/types';
import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';
import { softSwitch, softSwitchAt } from '@/shared/lib/softSwitch';
import { useForm } from '@/shared/lib/useForm';
import { BookStep } from './BookStep';
import { CopyStep } from './CopyStep';
import { CoverPicker } from './CoverPicker';
import { coverChoices, extrasForEdition, withEdition } from './catalogue';
import {
  bookFieldNames,
  emptyFields,
  type DraftExtras,
  type DraftFields,
} from './draft';
import { emptyLists, tidyLists, type DraftLists } from './entries';
import { FormButtons } from './FormButtons';
import { FormNotice } from './FormNotice';
import { StepHeading, type Step } from './StepHeading';
import { ROOM_ABOVE, useStepScroll } from './useStepScroll';
import { toBookInput } from './toBookInput';

export type DraftForm = ReturnType<typeof useForm<DraftFields>>;

type BookFormProps = {
  // Prefilled from the catalogue, or from the book being changed
  fields: Partial<DraftFields>;
  extras: DraftExtras;
  lists?: DraftLists;
  editions: CatalogueEdition[];
  // The book on the shelves being changed; left out for a new one
  editing?: Book;
  onSaved: () => void;
  // Choosing another book to add, or leaving the changes unsaved
  onBack: () => void;
};

// The step a problem is on, to go back to it
const stepOf = (errors: Record<string, string>): Step | null =>
  bookFieldNames.some((name) => errors[name])
    ? 'book'
    : Object.keys(errors).some((key) => key.startsWith('copy.') && errors[key])
      ? 'copy'
      : null;

// A book in two steps: the book itself, prefilled from the catalogue and
// editable, then the reader's own copy of it. Adding goes through them in
// turn; changing a book on the shelves can save from either.
export function BookForm({
  fields,
  extras: initialExtras,
  lists: initialLists = emptyLists,
  editions,
  editing,
  onSaved,
  onBack,
}: BookFormProps) {
  const addBook = useAddBook();
  const updateBook = useUpdateBook();
  const [step, setStep] = useState<Step>('book');
  const [extras, setExtras] = useState(initialExtras);
  const [lists, setLists] = useState<DraftLists>(initialLists);

  // Set once the reader says yes, it's a second copy of a book they have
  const anotherCopy = useRef(false);
  const form = useForm<DraftFields>(
    { ...emptyFields, ...fields },
    async (values) => {
      const tidied = tidyLists(lists);
      setLists(tidied);
      const input = toBookInput(values, extras, tidied);
      if (editing) {
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
        });
      }
      onSaved();
    },
  );

  const stepHeading = useStepScroll(step, Boolean(editing));
  const formRef = useRef<HTMLFormElement>(null);
  // Changing a book, over to the other step from the buttons below it: up
  // to where that step starts first, the book's from its cover, the copy's
  // from the tabs; and kept there as the step changes, though what's above
  // may change with it (on a phone, the copy has no cover choices)
  const switchFromBelow = (next: Step) => {
    const startOf = () => {
      const start = next === 'book' ? formRef.current : stepHeading.current;
      if (!start) return 0;
      return Math.max(
        0,
        pageScrollY(start) + start.getBoundingClientRect().top - ROOM_ABOVE,
      );
    };
    softSwitchAt(
      startOf(),
      () => setStep(next),
      () => scrollPageTo(startOf()),
    );
  };

  // A problem on the other step sends the reader over to it
  const errorStep = stepOf(form.errors);
  const [sawErrorStep, setSawErrorStep] = useState(errorStep);
  if (errorStep !== sawErrorStep) {
    setSawErrorStep(errorStep);
    if (errorStep) setStep(errorStep);
  }

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (step === 'book') {
      // The two things every book needs; everything else may stay empty
      const missing = {
        ...(!form.values.title.trim() && {
          title: 'Every book needs a title.',
        }),
        ...(!form.values.authors.trim() && { authors: 'Who wrote it?' }),
      };
      if (Object.keys(missing).length) {
        form.setErrors((errors) => ({ ...errors, ...missing }));
        return;
      }
      if (!editing) {
        setStep('copy');
        return;
      }
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
        onStep={editing ? switchFromBelow : setStep}
        editing={Boolean(editing)}
        saving={saving}
        onBack={onBack}
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
        />
        {/* Changing a book, one step comes in softly in place of the
            other; adding one, each rises in afresh as it's reached */}
        <div key={step} className={editing ? 'soft-switch' : 'animate-rise'}>
          {step === 'book' ? (
            <BookStep
              form={form}
              editions={editions}
              edition={extras.openLibrary?.edition}
              onChooseEdition={chooseEdition}
              genres={extras.genres ?? []}
              onGenresChange={(genres) => setExtras((x) => ({ ...x, genres }))}
              workKey={extras.openLibrary?.work}
              footer={footer}
            />
          ) : (
            <CopyStep
              form={form}
              lists={lists}
              onListsChange={setLists}
              footer={footer}
            />
          )}
        </div>
      </div>
    </form>
  );
}
