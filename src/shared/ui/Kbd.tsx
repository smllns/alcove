import { cn } from '@/shared/lib/cn';

// A key to press, as a small hint beside what it does (⌘K, esc)
export function Kbd({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'rounded-md border border-line px-1.5 py-0.5 font-sans text-[11px] text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
