import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useAddBook } from '@/entities/book/queries';
import type { CatalogueEdition } from '@/entities/book/types';
import { ApiError } from '@/shared/api/http';
import { cn } from '@/shared/lib/cn';
import { useForm } from '@/shared/lib/useForm';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { labelClass } from '@/shared/ui/fieldStyles';
import { FormError } from '@/shared/ui/FormError';
import { Notice } from '@/shared/ui/Notice';
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
import { toBookInput } from './toBookInput';

export type DraftForm = ReturnType<typeof useForm<DraftFields>>;

type AddBookFormProps = {
  // Prefilled from the catalogue; the copy's own fields start empty
  fields: Pick<DraftFields, (typeof bookFieldNames)[number]>;
  extras: DraftExtras;
  editions: CatalogueEdition[];
  onBack: () => void;
};

type Step = 'book' | 'copy';

// Everything an error can be about and still be shown beside its field
const shownBeside = (key: string) =>
  key in emptyFields ||
  /^copy\.((quotes|notes)\.\d+|links\.\d+\.(label|url))$/.test(key);

// Adding a book in two steps: the book itself, prefilled from the catalogue
// and editable, then the reader's own copy of it
export function AddBookForm({
  fields,
  extras: initialExtras,
  editions,
  onBack,
}: AddBookFormProps) {
  const navigate = useTransitionNavigate();
  const addBook = useAddBook();
  const [step, setStep] = useState<Step>('book');
  const [extras, setExtras] = useState(initialExtras);
  const [lists, setLists] = useState<DraftLists>(emptyLists);

  // Set once the reader says yes, it's a second copy of a book they have
  const anotherCopy = useRef(false);
  const form = useForm<DraftFields>(
    { ...emptyFields, ...fields },
    async (values) => {
      const tidied = tidyLists(lists);
      setLists(tidied);
      await addBook.mutateAsync({
        ...toBookInput(values, extras, tidied),
        anotherCopy: anotherCopy.current,
      });
      navigate('/library', 'forward');
    },
  );

  // Each step starts from its heading. Once the new step is on screen, as
  // the page may have changed height with it (on a phone the second step
  // drops the cover choices); only if the heading is out of easy view.
  const stepHeading = useRef<HTMLParagraphElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const top = stepHeading.current?.getBoundingClientRect().top;
    if (top === undefined || (top > 0 && top < innerHeight / 3)) return;
    window.scrollTo({ top: scrollY + top - 96, behavior: 'smooth' });
  }, [step]);

  // A problem with the book's own fields sends the reader back to them
  const bookError = bookFieldNames.some((name) => form.errors[name]);
  const [sawBookError, setSawBookError] = useState(bookError);
  if (bookError !== sawBookError) {
    setSawBookError(bookError);
    if (bookError) setStep('book');
  }

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (step === 'copy') {
      void form.onSubmit();
      return;
    }
    // The two things every book needs; everything else may stay empty
    const missing = {
      ...(!form.values.title.trim() && { title: 'Every book needs a title.' }),
      ...(!form.values.authors.trim() && { authors: 'Who wrote it?' }),
    };
    if (Object.keys(missing).length) {
      form.setErrors((errors) => ({ ...errors, ...missing }));
      return;
    }
    setStep('copy');
  };

  const chooseEdition = (edition: CatalogueEdition | null) => {
    form.setValues((v) => withEdition(v, edition));
    setExtras((x) => extrasForEdition(x, edition));
  };

  const alreadyShelved =
    addBook.error instanceof ApiError &&
    addBook.error.code === 'already_shelved' &&
    Boolean(form.formError);
  const addAnotherCopy = () => {
    anotherCopy.current = true;
    void form.onSubmit();
  };
  // Problems with nothing on screen to sit beside, so they aren't missed
  const stray = Object.entries(form.errors)
    .filter(([key, message]) => message && !shownBeside(key))
    .map(([, message]) => message);

  const notice = alreadyShelved ? (
    <div className='animate-rise'>
      <Notice
        title={form.formError}
        action='Add another copy'
        onAction={addAnotherCopy}
      >
        Is this a second copy? Then add it anyway.
      </Notice>
    </div>
  ) : (
    <FormError message={form.formError ?? (stray.join(' ') || null)} />
  );

  return (
    <form
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
        <p
          ref={stepHeading}
          className={cn('mb-8 flex items-baseline gap-3', labelClass)}
        >
          <span className='text-faint'>
            Step {step === 'book' ? 1 : 2} of 2
          </span>
          <span className='text-ink'>
            {step === 'book' ? 'The book' : 'Your copy'}
          </span>
        </p>
        {/* Each step rises in afresh */}
        <div key={step} className='animate-rise'>
          {step === 'book' ? (
            <BookStep
              form={form}
              editions={editions}
              edition={extras.openLibrary?.edition}
              onChooseEdition={chooseEdition}
              genres={extras.genres ?? []}
              onGenresChange={(genres) => setExtras((x) => ({ ...x, genres }))}
              onBack={onBack}
            />
          ) : (
            <CopyStep
              form={form}
              lists={lists}
              onListsChange={setLists}
              saving={form.status === 'saving'}
              notice={notice}
              onBack={() => setStep('book')}
            />
          )}
        </div>
      </div>
    </form>
  );
}
