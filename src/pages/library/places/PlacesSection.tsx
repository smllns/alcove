import { useMemo } from 'react';
import { usePlaces } from '@/entities/place/queries';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { ComingSoon } from '../ComingSoon';
import { isPhysical } from '@/entities/book/nonPhysical';
import type { Shelf } from '@/entities/book/useShelf';
import { PlacesView } from './PlacesView';
import { SetUpPlaces } from './SetUpPlaces';
import { UnplacedBooks } from './UnplacedBooks';

// The books where they're kept (the physical ones: a book read without
// having it stands nowhere). Until there's anything to show, the way
// there: the places to name, then the books to put in them.
export function PlacesSection({ shelf }: { shelf: Shelf }) {
  const places = usePlaces();
  const physical = useMemo(
    () => (shelf.complete ? shelf.all.filter(isPhysical) : undefined),
    [shelf.complete, shelf.all],
  );
  if (places.isPending) return <Loading />;
  if (places.isError)
    return (
      <FormError
        message={`Your places didn’t load. ${places.error.message}`}
        className='py-10 text-center'
      />
    );

  if (!physical) return <Loading />;

  const { homes, counts } = places.data;
  // With no places, the way to name them is always here
  if (!homes.length)
    return <SetUpPlaces books={physical.length} counts={counts} />;
  if (!physical.length) return <ComingSoon section='places' />;
  // Each book counts in its home too, so a home's count is all of them
  if (homes.some((home) => counts[home.id]))
    return <PlacesView homes={homes} books={physical} />;
  return <UnplacedBooks books={physical} />;
}
