import { useEditBook } from '@/entities/book/queries';
import {
  loadDescriptionLabel,
  useCatalogueDescription,
} from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Collapse } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { FormError } from '@/shared/ui/FormError';
import { AddButton } from '@/shared/ui/ListControls';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { aboutTextClass } from './aboutText';
import { BookSection } from './BookSection';
import { EditingHint } from '@/shared/ui/EditingHint';
import { InlineEditor } from '@/shared/ui/InlineEditor';
import { useWriteInPlace } from '@/shared/lib/useWriteInPlace';

// What the book is about, in its own paragraphs, folded to its first lines
// when it's long; changing it is for the book's edit page. With nothing
// said yet, it's written right here: a few lines of the reader's own, or
// the catalogue's to start from.
export function AboutBook({ book }: { book: Book }) {
  const { save, pending, error } = useEditBook(book);
  const description = (pending ?? book).description;
  const { writing, start, done } = useWriteInPlace(description, (text) =>
    save({ description: text }),
  );

  const catalogue = useCatalogueDescription(book.openLibrary?.work);
  const fromCatalogue = async () => {
    const found = await catalogue.load();
    if (found) start(found);
  };

  return (
    <BookSection title='What it’s about'>
      {/* Text, the box to write it in, or the ways to start: one gives
          way to the next softly */}
      <SmoothHeight>
        <div
          key={writing !== null ? 'writing' : description ? 'text' : 'empty'}
          className='animate-fade-in'
        >
          {writing !== null ? (
            <InlineEditor
              initial={writing}
              label='What it’s about'
              placeholder='The story in a few lines, ideally without spoilers.'
              className={aboutTextClass}
              onDone={done}
            />
          ) : description ? (
            <Fold className={aboutTextClass}>{description}</Fold>
          ) : (
            <div>
              <p className='text-[15px] text-muted'>
                Nothing about the story yet.
              </p>
              <div className='mt-2 flex flex-wrap gap-x-6'>
                <AddButton onClick={() => start('')}>
                  Write a few lines
                </AddButton>
                {catalogue.available && (
                  <AddButton
                    onClick={() => void (catalogue.loading || fromCatalogue())}
                  >
                    {loadDescriptionLabel(catalogue.loading)}
                  </AddButton>
                )}
              </div>
              <Collapse open={catalogue.missing}>
                <p className='mt-2 text-xs text-faint'>
                  Open Library doesn’t describe this one.
                </p>
              </Collapse>
              <FormError
                message={
                  catalogue.failed
                    ? 'Open Library didn’t answer. Try again in a moment.'
                    : null
                }
                small
                className='mt-2'
              />
            </div>
          )}
        </div>
      </SmoothHeight>
      <EditingHint show={writing !== null} />
      <FormError message={error} small className='mt-2' />
    </BookSection>
  );
}
