import { fine, type Drawing } from './drawing';

// A picture on the wall, as an architect draws one: its frame, and the
// mount inside it, lying or standing
export const pictures = {
  landscape: {
    box: '0 0 46 34',
    width: 44,
    draw: () => (
      <>
        <rect x='1' y='1' width='44' height='32' {...fine} />
        <rect x='7' y='7' width='32' height='20' {...fine} opacity='0.7' />
      </>
    ),
  },
  portrait: {
    box: '0 0 34 46',
    width: 32,
    draw: () => (
      <>
        <rect x='1' y='1' width='32' height='44' {...fine} />
        <rect x='7' y='7' width='20' height='32' {...fine} opacity='0.7' />
      </>
    ),
  },
} satisfies Record<string, Drawing>;
