import type { ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type QuietButtonProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

// Words that do something, without a button's weight: "Read more"
export function QuietButton({
  onClick,
  children,
  className,
}: QuietButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex w-fit cursor-pointer items-center gap-1.5 py-1 text-sm text-muted transition-colors duration-500 ease-soft hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}

// A quiet "+ Add something" for optional parts of the form
export function AddButton({ children, ...props }: QuietButtonProps) {
  return (
    <QuietButton {...props}>
      <Plus size={14} />
      {children}
    </QuietButton>
  );
}

// A small round × for taking an optional part away again
export function RemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      title={label}
      className='grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-faint transition-colors duration-500 ease-soft hover:bg-line/60 hover:text-ink'
    >
      <X size={15} />
    </button>
  );
}
