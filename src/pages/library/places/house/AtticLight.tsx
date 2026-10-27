import { EAVES, RIDGE, WALL } from '../drawing/section';

// The light of a home's attic lamp (HouseAttic), filling the attic up to
// the roof's slopes, under the roof as it's drawn (HouseSketch), so its
// edge is the roof's own line. Coming on as the attic is pointed at, or
// is the room in the middle of a phone's screen (styles/places.css).
export function AtticLight({
  width: w,
  roof,
}: {
  width: number;
  roof: number;
}) {
  const out = WALL + EAVES;
  return (
    <svg
      aria-hidden
      className='attic-light pointer-events-none absolute left-0 top-0 z-2 overflow-visible'
      width={w}
      height={roof}
    >
      <defs>
        <radialGradient
          id='attic-light'
          gradientUnits='userSpaceOnUse'
          cx={w / 2}
          cy={RIDGE + 24}
          r={Math.max(140, w * 0.32)}
        >
          <stop offset='0' style={{ stopColor: 'var(--light)' }} />
          <stop
            offset='1'
            style={{ stopColor: 'var(--light)', stopOpacity: 0 }}
          />
        </radialGradient>
      </defs>
      <polygon
        points={`${-out},${roof} ${w / 2},${RIDGE} ${w + out},${roof}`}
        fill='url(#attic-light)'
      />
    </svg>
  );
}
