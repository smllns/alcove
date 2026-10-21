import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const STARS = 5;
// The gold the filled stars are painted with, lighter at the top. Drawn
// once, around every page (app/RootLayout).
const GOLD = 'star-gold';

export function GoldGradient() {
  return (
    <svg aria-hidden width='0' height='0' className='absolute'>
      <defs>
        <linearGradient id={GOLD} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--gold-light)' }} />
          <stop offset='1' style={{ stopColor: 'var(--gold)' }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// The warm light around a gold star: a soft round patch behind it rather
// than a filter, which browsers draw blurry and pixelated over the star
// itself
function Glow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-[-12%] rounded-full bg-[radial-gradient(closest-side,var(--gold-glow),transparent)]',
        className,
      )}
    />
  );
}

const goldStar = (size: number, strokeWidth: number, className?: string) => (
  <Star
    size={size}
    strokeWidth={strokeWidth}
    fill={`url(#${GOLD})`}
    className={cn('relative text-gold', className)}
  />
);

// One star in gold, glowing a little. Sized by `className` when it should
// follow the text around it.
export function GoldStar({
  size,
  strokeWidth = 1.25,
  className,
}: {
  size: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-grid shrink-0 place-items-center',
        className,
      )}
    >
      <Glow />
      {goldStar(size, strokeWidth, 'size-full')}
    </span>
  );
}

// Five stars filled as far as `value` reaches, to the fraction: 4.2 fills
// four and a fifth. Only a picture; what it means is the caller's to say.
export function Stars({
  value,
  size = 28,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn('flex', className)}>
      {Array.from({ length: STARS }, (_, i) => {
        const fill = Math.min(Math.max(value - i, 0), 1);
        return (
          <span key={i} className='relative block px-0.5'>
            {/* As bright as the star is full */}
            <span
              className='absolute inset-y-0 left-0.5 transition-opacity duration-200 ease-soft'
              style={{ width: size, opacity: fill && 0.4 + fill * 0.6 }}
            >
              <Glow />
            </span>
            <Star
              size={size}
              strokeWidth={1.25}
              // Empty: a faint outline, a touch lighter on the dark paper
              className='relative text-line dark:text-faint/70'
            />
            <span
              className='absolute inset-y-0 left-0.5 overflow-hidden transition-[width] duration-200 ease-soft'
              style={{ width: `${fill * size}px` }}
            >
              {goldStar(size, 1.25)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
