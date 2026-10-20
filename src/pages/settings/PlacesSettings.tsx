import { usePlaces } from '@/entities/place/queries';
import { PlacesEditor } from '@/features/places';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';

export function PlacesSettings() {
  const places = usePlaces();
  if (places.isPending) return <Loading className='justify-start py-4' />;
  if (places.isError)
    return (
      <FormError message={`Your places didn’t load. ${places.error.message}`} />
    );
  return (
    <PlacesEditor
      homes={places.data.homes}
      counts={places.data.counts}
      submitLabel='Save places'
      quiet
    />
  );
}
