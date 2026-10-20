import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { RemoveButton } from '@/shared/ui/ListControls';
import { TextField } from '@/shared/ui/TextField';

type CoverLinkFieldProps = {
  open: boolean;
  busy: boolean;
  error: string | null;
  // Resolves true once the picture is the cover
  onSubmit: (url: string) => Promise<boolean>;
  onClose: () => void;
};

// A place to paste the address of a picture found somewhere online
export function CoverLinkField({
  open,
  busy,
  error,
  onSubmit,
  onClose,
}: CoverLinkFieldProps) {
  const [url, setUrl] = useState('');

  const submit = async () => {
    if (!url.trim() || busy) return;
    if (await onSubmit(url.trim())) {
      setUrl('');
      onClose();
    }
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
              void submit();
            }
          }}
        />
        <Button
          variant='pill'
          onClick={() => void submit()}
          loading={busy}
          disabled={!url.trim()}
        >
          Use
        </Button>
        <RemoveButton onClick={onClose} label='Cancel' />
      </div>
    </Collapse>
  );
}
