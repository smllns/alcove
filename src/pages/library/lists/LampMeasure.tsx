import { floorLamps } from '../places/drawing/pieces/lamps';

const lamp = floorLamps.classic;

// Where the measure on the lamp's pole starts: a little under its shade
// and bulb (the shade's foot at 20 of the drawing's 150), so its top
// number stands clear of them
export const MEASURE_TOP = `calc(${(20 / 150) * 100}% + 1.25rem)`;

// A standing lamp from the rooms, as tall as what's beside it, its pole
// marked as a measure is: at each of `ticks`, a step across it and the
// number beside it, `at` its height from the floor. Its light round its
// shade (.list-lamp-glow) comes on with the list's (ListLamp).
export function LampMeasure({
  ticks,
  at,
}: {
  ticks: number[];
  at: (n: number) => string;
}) {
  return (
    <div className='relative h-full shrink-0'>
      <span aria-hidden className='list-lamp-glow' />
      <svg
        aria-hidden
        viewBox={lamp.box}
        className='relative block h-full w-auto overflow-visible'
      >
        {lamp.draw()}
      </svg>
      <div className='absolute bottom-0 left-1/2' style={{ top: MEASURE_TOP }}>
        {ticks.map((n) => (
          <span
            key={n}
            className='absolute left-0 flex -translate-x-1/2 items-center'
            style={{ bottom: at(n) }}
          >
            <span className='w-2.5 border-t border-(--fine)' />
            <span className='absolute right-4 translate-y-px text-[11px] tabular-nums text-muted'>
              {n.toLocaleString('en')}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
