import { useState, type ComponentProps, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from './Tooltip';

// A small round button that shows when what holds it (a `group`) is
// hovered or reached with the keyboard, always on a touch screen, with its
// label in a tooltip: taking a book off the shelves, a note off its page,
// changing a review. `danger` for taking something away; `confirm` to ask
// first, on a touch screen.
export function HoverAction({
  label,
  ariaLabel = label,
  icon,
  onClick,
  danger = false,
  confirm,
  side,
  className,
}: {
  // Shown in the tooltip
  label: string;
  // Read out, when it needs to say more: "Remove “Dune”"
  ariaLabel?: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
  // Asked first on a touch screen, where it's easily tapped by mistake (a
  // pointer, aiming for it, needn't be asked)
  confirm?: { title: string; message: ReactNode; confirmLabel: string };
  // Where the tooltip goes: to the side, where there's no room above
  side?: ComponentProps<typeof Tooltip>['side'];
  // To place it, in a corner say
  className?: string;
}) {
  const touch = useMediaQuery('(hover: none)');
  const [asking, setAsking] = useState(false);

  return (
    <Tooltip label={label} side={side} className={className}>
      <button
        type='button'
        onClick={() => (confirm && touch ? setAsking(true) : onClick())}
        aria-label={ariaLabel}
        className={cn(
          'grid size-8 cursor-pointer place-items-center rounded-full border border-line bg-surface/90 text-ink-soft opacity-0 shadow-sm backdrop-blur-sm transition-all duration-700 ease-soft focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100',
          danger
            ? 'hover:border-danger hover:text-danger'
            : 'hover:border-ink hover:text-ink',
        )}
      >
        {icon}
      </button>
      {confirm && (
        <ConfirmDialog
          open={asking}
          title={confirm.title}
          confirmLabel={confirm.confirmLabel}
          tone={danger ? 'danger' : 'default'}
          onConfirm={() => {
            setAsking(false);
            onClick();
          }}
          onCancel={() => setAsking(false)}
        >
          {confirm.message}
        </ConfirmDialog>
      )}
    </Tooltip>
  );
}

// The usual one for taking something away: an × in red
export function RemoveAction(
  props: Omit<ComponentProps<typeof HoverAction>, 'icon' | 'danger'>,
) {
  return <HoverAction icon={<X size={15} />} danger {...props} />;
}
