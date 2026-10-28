// A home drawn small, in the thin line the places are drawn in: a roof
// over two floors of rooms
export function HouseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 150 92'
      aria-hidden
      fill='none'
      stroke='currentColor'
      strokeWidth={1.2}
      className={className}
    >
      <path d='M10 40 L75 8 L140 40' />
      <rect x='18' y='40' width='114' height='46' />
      <path d='M75 40v46M18 63h114' />
      <rect x='30' y='68' width='10' height='14' />
      <rect x='88' y='45' width='12' height='15' />
      <rect x='104' y='68' width='16' height='14' />
      <path d='M10 88h130' strokeWidth={0.8} opacity={0.6} />
    </svg>
  );
}
