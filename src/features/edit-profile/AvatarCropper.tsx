import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cropOf, MAX_ZOOM, scaleOf, type Size } from '@/shared/lib/crop';
import { errorText } from '@/shared/lib/errorText';
import { cropImage } from '@/shared/lib/image';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { Modal } from '@/shared/ui/Modal';
import { QuietButton } from '@/shared/ui/ListControls';
import { dialogClass } from '@/shared/ui/surfaces';
import { STEP, usePhotoPlacing } from './usePhotoPlacing';

// How wide the round frame is, at most, and the room left round it on a
// phone
const FRAME = 280;
const ROOM = 96;

// A photo chosen for the reader, placed before it's kept (usePhotoPlacing,
// and the slider and buttons here), in a circle, as it shows everywhere.
// Kept, the square around the circle is cut out and handed to `onSave`.
export function AvatarCropper({
  open,
  file,
  onCancel,
  onSave,
}: {
  open: boolean;
  // The photo being placed (the last, kept as it closes)
  file: File | null;
  onCancel: () => void;
  onSave: (image: string) => Promise<void>;
}) {
  const url = useMemo(() => file && URL.createObjectURL(file), [file]);
  const [photo, setPhoto] = useState<Size | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frame] = useState(() => {
    const width = Math.min(FRAME, innerWidth - ROOM);
    return { width, height: width };
  });
  const { placed, reset, zoomTo, box, handlers } = usePhotoPlacing(
    photo,
    frame,
  );

  // A new photo: shown from a local address (let go once it's done
  // with), placed afresh
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  const [placing, setPlacing] = useState(file);
  if (placing !== file) {
    setPlacing(file);
    setPhoto(null);
    reset();
    setError(null);
  }

  const save = async () => {
    if (!file || !photo) return;
    setBusy(true);
    setError(null);
    try {
      await onSave(await cropImage(file, cropOf(photo, frame, placed)));
    } catch (err) {
      setError(errorText(err, 'That photo didn’t work.'));
    } finally {
      setBusy(false);
    }
  };

  const scale = photo ? scaleOf(photo, frame, placed.zoom) : 1;
  return (
    <Modal open={open} onClose={onCancel} className={dialogClass}>
      <div className='flex flex-col items-center gap-5 p-6 sm:p-7'>
        <h2 className='self-start font-serif text-2xl tracking-[-0.01em]'>
          Place your photo
        </h2>
        <div
          ref={box}
          role='img'
          aria-label='Your photo in its frame. Drag to move it, use the arrows to nudge it, and plus or minus to zoom.'
          tabIndex={0}
          {...handlers}
          className='relative cursor-grab touch-none select-none overflow-hidden rounded-full bg-ink/8 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink active:cursor-grabbing'
          style={frame}
        >
          {url && (
            <img
              src={url}
              alt=''
              draggable={false}
              onLoad={(e) =>
                setPhoto({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }
              className='absolute left-1/2 top-1/2 max-w-none origin-center'
              style={
                photo
                  ? {
                      width: photo.width,
                      height: photo.height,
                      transform: `translate(-50%, -50%) translate(${placed.x}px, ${placed.y}px) scale(${scale})`,
                    }
                  : { opacity: 0 }
              }
            />
          )}
        </div>
        <div className='flex w-full items-center gap-3'>
          <ZoomButton
            label='Zoom out'
            onClick={() => zoomTo(placed.zoom / STEP)}
          >
            <Minus size={16} />
          </ZoomButton>
          <input
            type='range'
            aria-label='Zoom'
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={placed.zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            className='h-1 flex-1 cursor-pointer accent-ink'
          />
          <ZoomButton
            label='Zoom in'
            onClick={() => zoomTo(placed.zoom * STEP)}
          >
            <Plus size={16} />
          </ZoomButton>
        </div>
        <FormError message={error} small className='self-start' />
        <div className='flex w-full items-center justify-end gap-4'>
          <QuietButton onClick={onCancel} className='text-sm'>
            Cancel
          </QuietButton>
          <Button loading={busy} disabled={!photo} onClick={() => void save()}>
            Save photo
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// A quiet round button beside the slider, zooming one step
function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      className='grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors duration-300 ease-soft hover:bg-ink/5 hover:text-ink'
    >
      {children}
    </button>
  );
}
