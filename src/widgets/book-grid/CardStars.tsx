import { AverageRating, Rating } from '@/shared/ui/Rating';

// The stars under a cover in a grid: those given it (by the reader, or by
// whoever's books they are), or else how readers at large rate it, if
// that's known
export function CardStars({
  stars,
  average,
  className,
}: {
  stars?: number;
  average?: number;
  className?: string;
}) {
  if (stars) return <Rating value={stars} className={className} />;
  if (average) return <AverageRating value={average} className={className} />;
  return null;
}
