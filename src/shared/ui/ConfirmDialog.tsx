import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { FormError } from './FormError';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  error?: string | null;
  // Red for things that can't be undone
  tone?: 'danger' | 'default';
};

// A modal question with a way out. Built on <dialog>, so focus stays inside
// and Escape cancels; a click on the dimmed page around it cancels too. It
// comes and goes softly (.soft-dialog, index.css).
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
  error = null,
  tone = 'danger',
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start on the safe choice, so a stray Enter doesn't destroy anything
      cancel.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className='m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-[0_30px_60px_-30px_rgba(40,28,14,0.55)] soft-dialog'
    >
      <div className='flex flex-col gap-4 p-6 sm:p-8'>
        <h2 className='font-serif text-2xl leading-tight tracking-[-0.01em]'>
          {title}
        </h2>
        {children && (
          <div className='text-sm leading-6 text-ink-soft'>{children}</div>
        )}
        <FormError message={error} />
        <div className='mt-2 flex flex-wrap items-center gap-3'>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
          <Button
            variant='pill'
            onClick={onCancel}
            disabled={busy}
            ref={cancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </dialog>
  );
}
