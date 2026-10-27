import { usePlaces } from '@/entities/place/queries';
import { PlacesEditor } from '@/features/places';
import { Button } from '@/shared/ui/Button';

// One home of the places changed in place of its drawing or cards: its
// name, its rooms, bookcases and shelves, or the home taken away
// altogether. `onDone`: saved, or let be.
export function HomeEditor({
  home,
  onDone,
}: {
  home: string;
  onDone: () => void;
}) {
  const places = usePlaces().data;
  if (!places) return null;
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <PlacesEditor
        homes={places.homes}
        counts={places.counts}
        only={home}
        submitLabel='Save'
        onSaved={onDone}
        secondary={
          <Button variant='secondary' onClick={onDone}>
            Cancel
          </Button>
        }
      />
    </div>
  );
}
