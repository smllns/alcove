import { fine, type Drawing } from './drawing';

// Somewhere to sit and read, in outline, true to size beside the
// bookcases: an armchair with its back set square over its seat, a
// mid-century one on a frame, a wingback, a plain chair
export const seats = {
  armchair: {
    box: '0 0 60 58',
    width: 60,
    draw: () => (
      <>
        <rect x='9' y='1' width='42' height='28' rx='5' {...fine} />
        <rect x='2' y='24' width='56' height='16' rx='4' {...fine} />
        <path d='M8 40l-1.5 17.6M52 40l1.5 17.6' {...fine} />
      </>
    ),
  },
  midCentury: {
    box: '0 0 60 58',
    width: 60,
    draw: () => (
      <>
        <path d='M12 6h36a3 3 0 0 1 3 3v17H9V9a3 3 0 0 1 3-3z' {...fine} />
        <rect x='9' y='26' width='42' height='9' rx='2' {...fine} />
        <path
          d='M4 20h6M50 20h6M4 20v15h5M56 20v15h-5M12 35l-3 22.6M48 35l3 22.6'
          {...fine}
        />
      </>
    ),
  },
  wingback: {
    box: '0 0 60 58',
    width: 60,
    draw: () => (
      <>
        <path d='M14 2h32v26H14z' {...fine} />
        <path d='M14 8q-8 2-8 12v8M46 8q8 2 8 12v8' {...fine} />
        <rect x='4' y='28' width='52' height='14' rx='3' {...fine} />
        <path d='M9 42v15.6M51 42v15.6' {...fine} />
      </>
    ),
  },
  chair: {
    box: '0 0 28 62',
    width: 28,
    draw: () => <path d='M2 61.6V1M2 35h24v26.6' {...fine} />,
  },
} satisfies Record<string, Drawing>;
