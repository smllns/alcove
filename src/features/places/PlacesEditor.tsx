import { counted } from '@/shared/lib/plural';
import type { ReactNode, SubmitEvent } from 'react';
import type { Home } from '@/entities/place/types';
import { cn } from '@/shared/lib/cn';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { AddButton } from '@/shared/ui/ListControls';
import { Notice } from '@/shared/ui/Notice';
import { floatingClass } from '@/shared/ui/surfaces';
import { PlaceNode } from './PlaceNode';
import { usePlacesDraft } from './usePlacesDraft';

type PlacesEditorProps = {
  homes: Home[];
  counts: Record<string, number>;
  // Start with an empty home ready to be named (for a reader with none)
  startBlank?: boolean;
  submitLabel: string;
  onSaved?: () => void;
  // Beside the save button, e.g. "Set up later"
  secondary?: ReactNode;
  // Among other settings: the save button only there once there's a
  // change to save (and a moment after, to say it's saved)
  quiet?: boolean;
  // Just the one home with this id to change (or remove), the rest kept
  // as they are
  only?: string;
};

// Homes, rooms, bookcases and shelves, named and arranged by the reader.
// Only names matter; a place can be as broad (just a home) or as exact (a
// shelf) as they like.
export function PlacesEditor({
  homes,
  counts,
  startBlank = false,
  submitLabel,
  onSaved,
  secondary,
  quiet = false,
  only,
}: PlacesEditorProps) {
  const places = usePlacesDraft({ homes, counts, startBlank, onSaved });
  const { draft, ops, moving } = places;
  const live = draft.filter((home) => !home.leaving).length;
  // "Saved" said for a moment before the button goes
  const savedAWhile = useDebouncedValue(places.justSaved, 1600);
  const saying = places.justSaved && !savedAWhile;
  const shown = !quiet || places.changed || places.saving || saying;

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    places.submit(false);
  };

  return (
    <form onSubmit={onSubmit} noValidate className='flex flex-col'>
      {draft.map(
        (home, i) =>
          (!only || home.id === only) && (
            <PlaceNode key={home.id} node={home} path={[i]} ops={ops} />
          ),
      )}
      {!only && (
        <>
          {!live && <p className='mb-4 text-sm text-muted'>No places yet.</p>}
          <AddButton onClick={() => ops.add([])}>
            {live ? 'Add another home' : 'Add a home'}
          </AddButton>
        </>
      )}

      <Collapse open={moving > 0}>
        <div className='mt-6'>
          <Notice
            title={`${counted(moving, 'book is', 'books are')} in places you removed.`}
            action='Save anyway'
            onAction={() => places.submit(true)}
          >
            Saving moves them up a level: off a removed shelf into its bookcase,
            out of a removed room into the home. A removed home leaves them
            without a place until you give them a new one.
          </Notice>
        </div>
      </Collapse>

      <FormError message={places.error} className='-mb-4 mt-8' />
      {/* Quiet (among the settings), it only fades in and out, its room
          kept so nothing under it moves; and with changes to save, it
          floats at the bottom of the screen while the form is in view (the
          change may be in the first of many homes, far above the end),
          then rests here at its end */}
      <div
        inert={!shown}
        className={cn(
          'z-10 -mx-1.5 mt-8 flex w-fit flex-wrap items-center gap-3 rounded-full border p-1.5 pr-5 transition-[opacity,background-color,border-color,box-shadow] duration-500 ease-soft',
          quiet && 'sticky bottom-4',
          quiet || places.changed ? floatingClass : 'border-transparent',
          !shown && 'opacity-0',
        )}
      >
        <Button
          type='submit'
          // Only when saving leads on somewhere (`onSaved`)
          arrow={Boolean(onSaved) && !places.justSaved && !quiet}
          loading={places.saving}
          disabled={!places.changed && !startBlank}
        >
          {places.justSaved && !places.changed && !quiet
            ? 'Saved'
            : submitLabel}
        </Button>
        {secondary}
        {(places.changed || quiet) && (
          <span className='text-sm text-muted'>
            {places.changed || places.saving
              ? 'Unsaved changes'
              : 'All changes saved'}
          </span>
        )}
      </div>
    </form>
  );
}
