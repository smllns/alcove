import { useState } from 'react';
import { useEditCopy } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { RemoveAction } from '@/shared/ui/HoverAction';
import { FormError } from '@/shared/ui/FormError';
import { AddButton } from '@/shared/ui/ListControls';
import { editedList, type Editing } from '@/shared/lib/editList';
import { InlineEditor } from '@/shared/ui/InlineEditor';
import { EditableText } from '@/shared/ui/EditableText';
import { EditingHint } from '@/shared/ui/EditingHint';
import { Sticky } from './Sticky';
import { takeOffConfirm } from './takeOffConfirm';

// One line of writing to each ruled line of its sheet (Sticky)
const noteText =
  'whitespace-pre-line font-serif text-base leading-[28px] text-(--note-ink)';

// The reader's notes as sticky notes on the page, each as tall as it needs
// to be. Written, changed and taken off right here: a new blank one to
// write on, a click on one to change it, × to take it off.
export function StickyNotes({ book }: { book: Book }) {
  const { save, pending, error } = useEditCopy(book);
  const notes = (pending ?? book.copy)?.notes ?? [];
  const [editing, setEditing] = useState<Editing | null>(null);

  const done = (at: Editing, text: string | null) => {
    setEditing(null);
    const next = text === null ? null : editedList(notes, at, text);
    if (next) save({ notes: next });
  };

  const editor = (at: Editing, initial: string) => (
    <InlineEditor
      initial={initial}
      label='Note'
      placeholder='Something worth saying about it…'
      className={noteText}
      onDone={(text) => done(at, text)}
    />
  );

  return (
    <div>
      {/* A grid, not columns: what reaches out of a note (its × and the
          label over it) would be cut off at a column's top edge */}
      <ul className='grid items-start gap-x-6 gap-y-8 pt-3 sm:grid-cols-2 lg:grid-cols-3'>
        {notes.map((note, i) => (
          <li key={i}>
            <Sticky nth={i}>
              {editing === i ? (
                editor(i, note)
              ) : (
                <>
                  <EditableText
                    label='Change this note'
                    onEdit={() => setEditing(i)}
                    className={noteText}
                  >
                    {note}
                  </EditableText>
                  <RemoveAction
                    label='Take this note off'
                    onClick={() => done(i, '')}
                    confirm={takeOffConfirm('note')}
                    className='absolute -right-2 -top-3'
                  />
                </>
              )}
            </Sticky>
          </li>
        ))}
        {editing === 'new' && (
          <li className='animate-fade-in'>
            <Sticky nth={notes.length}>{editor('new', '')}</Sticky>
          </li>
        )}
      </ul>
      <EditingHint show={editing !== null} />
      {editing !== 'new' && (
        <AddButton
          onClick={() => setEditing('new')}
          // Clear of the notes' shadows
          className={notes.length ? 'mt-6' : '-mt-1'}
        >
          {notes.length ? 'Another note' : 'Add a note'}
        </AddButton>
      )}
      <FormError message={error} small />
    </div>
  );
}
