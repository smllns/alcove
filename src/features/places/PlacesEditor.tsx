import { counted } from '@/shared/lib/plural';
import type { ReactNode, SubmitEvent } from 'react';
import type { Home } from '@/entities/place/types';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { AddButton } from '@/shared/ui/ListControls';
import { Notice } from '@/shared/ui/Notice';
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
  // A quieter save button, among other settings
  quiet?: boolean;
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
}: PlacesEditorProps) {
  const places = usePlacesDraft({ homes, counts, startBlank, onSaved });
  const { draft, ops, moving } = places;
  const live = draft.filter((home) => !home.leaving).length;

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    places.submit(false);
  };

  return (
    <form onSubmit={onSubmit} noValidate className='flex flex-col'>
      {draft.map((home, i) => (
        <PlaceNode key={home.id} node={home} path={[i]} ops={ops} />
      ))}
      {!live && <p className='mb-4 text-sm text-muted'>No places yet.</p>}
      <AddButton onClick={() => ops.add([])}>
        {live ? 'Add another home' : 'Add a home'}
      </AddButton>

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

      <div className='mt-8 flex flex-col gap-4'>
        <FormError message={places.error} />
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='submit'
            variant={quiet ? 'secondary' : 'primary'}
            arrow={!places.justSaved && !quiet}
            loading={places.saving}
            disabled={!places.changed && !startBlank}
          >
            {places.justSaved && !places.changed ? 'Saved' : submitLabel}
          </Button>
          {secondary}
        </div>
      </div>
    </form>
  );
}
