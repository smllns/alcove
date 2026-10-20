import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Collapse } from './Collapse';
import { AddButton } from './ListControls';

type RevealProps = {
  // The quiet link that opens it, e.g. "Add a subtitle"
  addLabel: string;
  // Open from the start, e.g. when there's already something in it
  initiallyOpen?: boolean;
  // Empties what's inside, as it closes again
  onRemove: () => void;
  // Given `remove`, for the × that closes it
  children: (remove: () => void) => ReactNode;
};

// Optional fields that most books don't need: a link until asked for, then
// the fields, focused and ready. Sits snug under the field above while it's
// just the link; open, it takes a full gap like any other field.
export function Reveal({
  addLabel,
  initiallyOpen = false,
  onRemove,
  children,
}: RevealProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const inside = useRef<HTMLDivElement>(null);

  const show = () => {
    setOpen(true);
    // Once it's no longer inert
    requestAnimationFrame(() =>
      inside.current?.querySelector('input')?.focus({ preventScroll: true }),
    );
  };
  const remove = () => {
    setOpen(false);
    onRemove();
  };

  return (
    <div
      className={cn(
        'transition-[margin] duration-700 ease-soft',
        !open && '-mt-3',
      )}
    >
      <Collapse open={!open}>
        <AddButton onClick={show}>{addLabel}</AddButton>
      </Collapse>
      <Collapse open={open}>
        <div ref={inside}>{children(remove)}</div>
      </Collapse>
    </div>
  );
}
