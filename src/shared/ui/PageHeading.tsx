import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// The heading block every page opens with: a small spaced-out eyebrow, a big
// serif title, a quiet lead line.
//
// `rise` (ms) fades the element up into place after that delay; leave it out
// for no entrance animation.

type TextProps = {
  children: ReactNode;
  className?: string;
  rise?: number;
};

const riseStyle = (rise?: number): CSSProperties | undefined =>
  rise === undefined ? undefined : { animationDelay: `${rise}ms` };

export function Eyebrow({ children, className, rise }: TextProps) {
  return (
    <p
      className={cn(
        'text-[10px] uppercase tracking-[0.32em] text-muted sm:text-xs',
        rise !== undefined && 'animate-rise',
        className,
      )}
      style={riseStyle(rise)}
    >
      {children}
    </p>
  );
}

const titleSizes = {
  // Beside something on a wide screen (settings, over its index)
  sm: 'text-[2.5rem] sm:text-5xl lg:text-[2.6rem]',
  md: 'text-[2.75rem] sm:text-6xl',
  lg: 'text-5xl sm:text-7xl',
};

export function PageTitle({
  children,
  className,
  rise,
  size = 'md',
}: TextProps & { size?: keyof typeof titleSizes }) {
  return (
    <h1
      className={cn(
        'font-serif leading-[0.95] tracking-tighter',
        titleSizes[size],
        rise !== undefined && 'animate-rise',
        className,
      )}
      style={riseStyle(rise)}
    >
      {children}
    </h1>
  );
}

export function Lead({ children, className, rise }: TextProps) {
  return (
    <p
      className={cn(
        'text-[15px] leading-6 text-muted sm:leading-7',
        rise !== undefined && 'animate-rise',
        className,
      )}
      style={riseStyle(rise)}
    >
      {children}
    </p>
  );
}
