import { usePlaces } from '@/entities/place/queries';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { ComingSoon } from '../ComingSoon';
import type { Shelf } from '../useShelf';
import { PlacesView } from './PlacesView';
import { SetUpPlaces } from './SetUpPlaces';
import { UnplacedBooks } from './UnplacedBooks';

// The books where they're kept. Until there's anything to show, the way
// there: the places to name, then the books to put in them. `total`: how
// many books there are in all.
export function PlacesSection({
  shelf,
  total,
}: {
  shelf: Shelf;
  total: number;
}) {
  const places = usePlaces();
  if (places.isPending) return <Loading />;
  if (places.isError)
    return (
      <FormError
        message={`Your places didn’t load. ${places.error.message}`}
        className='py-10 text-center'
      />
    );

  const { homes, counts } = places.data;
  // With no places, the way to name them is always here
  if (!homes.length) return <SetUpPlaces books={total} counts={counts} />;
  // Each book counts in its home too, so a home's count is all of them
  if (!total) return <ComingSoon section='places' />;
  if (homes.some((home) => counts[home.id]))
    return shelf.complete ? (
      <PlacesView homes={homes} books={shelf.all} />
    ) : (
      <Loading />
    );
  return <UnplacedBooks shelf={shelf} />;
}
