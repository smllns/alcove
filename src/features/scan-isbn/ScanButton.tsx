import { ScanBarcode } from 'lucide-react';
import { useState } from 'react';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { ScanSheet } from './ScanSheet';

// A way to find a book by its barcode, on a phone or tablet (nothing with
// a mouse, where there's rarely a camera to hold up to a book): the camera
// opened to read it, and the ISBN found handed on (`onFound`). Said in
// words, or (`icon`) only drawn, where a field leaves room for no more.
export function ScanButton({
  onFound,
  icon = false,
  className,
}: {
  onFound: (isbn: string) => void;
  icon?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const hover = useMediaQuery(HOVER);
  if (hover) return null;
  const scan = () => setOpen(true);
  return (
    <>
      {icon ? (
        <IconButton
          aria-label='Scan a barcode'
          onClick={scan}
          className={className}
        >
          <ScanBarcode size={16} />
        </IconButton>
      ) : (
        <Button variant='pill' onClick={scan} className={className}>
          <ScanBarcode size={16} />
          Scan a barcode
        </Button>
      )}
      <ScanSheet open={open} onClose={() => setOpen(false)} onFound={onFound} />
    </>
  );
}
