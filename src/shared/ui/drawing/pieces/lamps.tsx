import { fine, type Drawing } from './drawing';

// Lamps, in outline: their shades (.lamp-shade) fill with their light and
// their bulbs (.lamp-bulb) show as the room is pointed at (styles/places.css)

const cap = <path d='M10 0.5h4v2.5h-4z' {...fine} />;

// Hanging from the ceiling, drawn from where the cord meets the shade:
// the cord itself is the room's to draw, as long as it likes
export const pendants = {
  dome: {
    box: '0 0 24 18',
    width: 24,
    draw: () => (
      <>
        {cap}
        <circle className='lamp-bulb' cx='12' cy='14.5' r='2.4' />
        <path className='lamp-shade' d='M4 14c0-6 4-11 8-11s8 5 8 11z' />
      </>
    ),
  },
  cone: {
    box: '0 0 24 18',
    width: 22,
    draw: () => (
      <>
        {cap}
        <circle className='lamp-bulb' cx='12' cy='15' r='2.2' />
        <path className='lamp-shade' d='M9.5 3h5l7 12H2.5z' />
      </>
    ),
  },
  globe: {
    box: '0 0 24 22',
    width: 18,
    draw: () => (
      <>
        {cap}
        <circle className='lamp-shade' cx='12' cy='12' r='8.5' />
        <circle className='lamp-bulb' cx='12' cy='12' r='3' />
      </>
    ),
  },
  drum: {
    box: '0 0 24 18',
    width: 22,
    draw: () => (
      <>
        {cap}
        <circle className='lamp-bulb' cx='12' cy='14.5' r='2.2' />
        <rect
          className='lamp-shade'
          x='2.5'
          y='3'
          width='19'
          height='10'
          rx='1'
        />
      </>
    ),
  },
} satisfies Record<string, Drawing>;

// Standing on the floor, at one end of the room, well over a seat
export const floorLamps = {
  classic: {
    box: '0 0 30 150',
    width: 21,
    draw: () => (
      <>
        <path d='M15 20v129.6M8 149.6h14' {...fine} />
        <circle className='lamp-bulb' cx='15' cy='22' r='3.4' />
        <path className='lamp-shade' d='M7 2h16l5 18H2z' />
      </>
    ),
  },
  tripod: {
    box: '0 0 34 150',
    width: 24,
    draw: () => (
      <>
        <path d='M17 30L4 149.6M17 30l13 119.6M17 30v119.6' {...fine} />
        <circle className='lamp-bulb' cx='17' cy='25' r='2.8' />
        <rect
          className='lamp-shade'
          x='5'
          y='2'
          width='24'
          height='21'
          rx='1.5'
        />
      </>
    ),
  },
} satisfies Record<string, Drawing>;
