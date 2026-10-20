import { usePlaces } from '@/entities/place/queries';
import { PlacesEditor } from '@/features/places';
import { Spinner } from '@/shared/ui/Spinner';

export function PlacesSettings() {
  const places = usePlaces();
  if (places.isPending) {
    return (
      <div className='py-4 text-muted'>
        <Spinner />
      </div>
    );
  }
  if (places.isError) {
    return (
      <p className='text-sm text-danger'>
        Your places didn’t load. {places.error.message}
      </p>
    );
  }
  return (
    <PlacesEditor
      homes={places.data.homes}
      counts={places.data.counts}
      submitLabel='Save places'
      quiet
    />
  );
}
