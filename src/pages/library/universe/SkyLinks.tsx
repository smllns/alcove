import { memo } from 'react';
import type { Link } from './constellations';

// The lines joining each writer's books into a constellation, faint under
// the stars (universe.css). `kin`: the writer of the book under the
// pointer, whose lines show brighter.
export const SkyLinks = memo(function SkyLinks({
  links,
  kin,
}: {
  links: Link[];
  kin: string | null;
}) {
  if (!links.length) return null;
  return (
    <svg
      aria-hidden
      width='1'
      height='1'
      className='sky-links pointer-events-none absolute left-0 top-0 overflow-visible'
    >
      {links.map((link) => (
        <path
          key={link.path}
          d={link.path}
          data-kin={link.group === kin || undefined}
        />
      ))}
    </svg>
  );
});
