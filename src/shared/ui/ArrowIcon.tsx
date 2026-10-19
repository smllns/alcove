import { ArrowLeft, ArrowUpRight } from 'lucide-react';

const nudge = 'transition-transform duration-500 ease-soft';

// Trailing ↗ that nudges outward when its button is hovered
export function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <ArrowUpRight
      size={size}
      className={`${nudge} group-hover:-translate-y-0.5 group-hover:translate-x-0.5`}
    />
  );
}

// Leading ← that nudges back when its button is hovered
export function BackArrowIcon({ size = 15 }: { size?: number }) {
  return (
    <ArrowLeft
      size={size}
      className={`${nudge} group-hover:-translate-x-0.5`}
    />
  );
}
