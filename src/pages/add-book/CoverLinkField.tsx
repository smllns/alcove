import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { RemoveButton } from '@/shared/ui/ListControls';
import { TextField } from '@/shared/ui/TextField';

type CoverLinkFieldProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  // The link the cover now comes from, if it does
  added: string | null;
  onSubmit: (url: string) => Promise<void>;
  onClose: () => void;
};

// A place to paste the address of a picture found somewhere online. Once
// it's the cover, the link stays, marked as added, until it's changed.
export function CoverLinkField({
  open,
  busy,
  error,
  added,
  onSubmit,
  onClose,
}: CoverLinkFieldProps) {
  const [url, setUrl] = useState('');
  const isAdded = Boolean(added) && url.trim() === added;

  const submit = () => {
    if (!url.trim() || busy || isAdded) return;
    void onSubmit(url.trim());
  };

  return (
    <Collapse open={open}>
      <div className='flex items-end gap-2 pt-5'>
        <TextField
          className='min-w-0 flex-1'
          type='url'
          label='Picture link'
          placeholder='https://…'
          value={url}
          error={error ?? undefined}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            // Enter uses the picture rather than moving the form on
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        {isAdded ? (
          <span className='inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted'>
            <Check size={15} />
            Added
          </span>
        ) : (
          <Button
            variant='pill'
            onClick={submit}
            loading={busy}
            disabled={!url.trim()}
          >
            Use
          </Button>
        )}
        <RemoveButton onClick={onClose} label='Close' />
      </div>
    </Collapse>
  );
}
