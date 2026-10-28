import { useRef, type ReactNode } from 'react';
import { Button } from './Button';
import { FormError } from './FormError';
import { Modal } from './Modal';

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

// A modal question with a way out: Escape cancels, and so does a click on
// the dimmed page around it. It comes and goes softly (Modal).
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
  const cancel = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onCancel();
      }}
      // Start on the safe choice, so a stray Enter doesn't destroy anything
      focus={cancel}
      className='relative m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(40,28,14,0.55)]'
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
    </Modal>
  );
}
