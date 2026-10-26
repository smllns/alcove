import { memo } from 'react';
import type { Link } from './constellations';

// The lines joining each writer's books into a constellation, faint under
// the stars (universe.css). `kin`: the writer of the book under the
// pointer, whose lines show over the dimmed sky, darker.
export const SkyLinks = memo(function SkyLinks({
  links,
  kin,
}: {
  links: Link[];
  kin: string | null;
}) {
  if (!links.length) return null;
  const lines = (shown: Link[], className: string) => (
    <svg
      aria-hidden
      width='1'
      height='1'
      className={`${className} pointer-events-none absolute left-0 top-0 overflow-visible`}
    >
      {shown.map((link) => (
        <path key={link.path} d={link.path} />
      ))}
    </svg>
  );
  // All of them under the veil that dims the sky (SkyVeil), and the lit
  // writer's again over it
  return (
    <>
      {lines(links, 'sky-links')}
      {kin &&
        lines(
          links.filter((link) => link.group === kin),
          'sky-links sky-links-kin',
        )}
    </>
  );
});
