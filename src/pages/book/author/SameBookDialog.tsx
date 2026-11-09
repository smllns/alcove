import type { Book, SimilarBook } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { ownBookLine } from '@/entities/book/ui/ownBookLine';
import { Modal } from '@/shared/ui/Modal';
import { dialogClass } from '@/shared/ui/surfaces';
import { QuietButton } from '@/shared/ui/ListControls';

// Asked of a book from the catalogue the reader says they have: which of
// their books by the writer it is, why it wasn't seen to be, and a way out
export function SameBookDialog({
  work,
  open,
  theirs,
  onPick,
  onClose,
}: {
  // The last asked about, kept as it goes, so it doesn't empty on its way
  work?: SimilarBook;
  open: boolean;
  theirs: Book[];
  onPick: (book: Book) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} className={dialogClass}>
      <div className='flex flex-col gap-4 p-6 sm:p-7'>
        <h2 className='font-serif text-2xl leading-tight tracking-[-0.01em]'>
          Which of your books is this?
        </h2>
        <p className='text-sm leading-6 text-ink-soft'>
          Open Library often keeps a translation as a book of its own, so it
          can’t tell “{work?.title}” is one you have under another title. Say
          which, and alcove will count them as one everywhere.
        </p>
        <ul className='-mx-2 flex max-h-80 flex-col gap-1 overflow-y-auto'>
          {theirs.map((book) => (
            <li key={book.id}>
              <button
                type='button'
                onClick={() => onPick(book)}
                className='group flex w-full cursor-pointer rounded-xl p-2 text-left transition-colors duration-300 ease-soft hover:bg-ink/5 focus-visible:bg-ink/5'
              >
                <BookLine size='sm' {...ownBookLine(book)} />
              </button>
            </li>
          ))}
        </ul>
        <QuietButton onClick={onClose} className='self-end text-sm'>
          Not mine after all
        </QuietButton>
      </div>
    </Modal>
  );
}
