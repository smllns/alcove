import { Flashlight, FlashlightOff, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { buttonClass } from '@/shared/ui/buttonStyles';
import { IconButton } from '@/shared/ui/IconButton';
import { Modal } from '@/shared/ui/Modal';
import { Spinner } from '@/shared/ui/Spinner';
import { isbnInPhoto } from './detector';
import { useBarcodeCamera, type CameraState } from './useBarcodeCamera';
import { useTorch } from './useTorch';

type Found = (isbn: string) => void;

// What's said when the camera can't be had, each reason its own way
const unavailable: Partial<Record<CameraState, string>> = {
  insecure:
    'The camera only works over a secure connection. Open alcove at its https address, or take a photo of the barcode instead.',
  denied:
    'alcove isn’t allowed to use the camera. Allow it in your browser’s settings, or take a photo of the barcode instead.',
  missing: 'There’s no camera to use. Take a photo of the barcode instead.',
  broken:
    'The camera didn’t start. Close this and try again, or take a photo of the barcode instead.',
};

// The camera opened over the page to read a book's barcode: coming up from
// the bottom on a phone (pulled back down, or closed, to give up), the
// camera only on while it's open. The ISBN found is handed on (`onFound`)
// once it's gone, the focus back where it was, so what it leads to can
// take the focus.
export function ScanSheet({
  open,
  onClose,
  onFound,
}: {
  open: boolean;
  onClose: () => void;
  onFound: Found;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const found = useRef<string>(null);
  return (
    <Modal
      open={open}
      onClose={onClose}
      onClosed={() => {
        if (found.current) onFound(found.current);
        found.current = null;
      }}
      focus={close}
      motion='sheet'
      className='fixed inset-x-0 top-10 bottom-0 overflow-hidden rounded-t-[22px] bg-black text-white sm:inset-8 sm:rounded-[22px]'
    >
      <IconButton
        ref={close}
        aria-label='Close the camera'
        onClick={onClose}
        className='absolute top-4 right-4 z-10 border-white/30 bg-black/40 text-white'
      >
        <X size={18} />
      </IconButton>
      {open && (
        <Camera
          onFound={(isbn) => {
            found.current = isbn;
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

// What the camera sees, filling the sheet, and over it a frame to hold the
// barcode in, the rest dimmed, what to do, and the camera's light to turn
// on in the dark, where it has one; while it starts, a spinner;
// when it can't be had, a photo of the barcode to take instead
function Camera({ onFound }: { onFound: Found }) {
  const { video, state, track } = useBarcodeCamera(onFound);
  const torch = useTorch(track);
  const [missed, setMissed] = useState(false);
  const fromPhoto = async (file?: File) => {
    if (!file) return;
    const isbn = await isbnInPhoto(file).catch(() => null);
    if (isbn) onFound(isbn);
    else setMissed(true);
  };
  return (
    <>
      <video
        ref={video}
        muted
        playsInline
        className='absolute inset-0 size-full object-cover'
      />
      {unavailable[state] ? (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center'>
          <p className='max-w-xs font-serif text-xl leading-snug'>
            {missed
              ? 'No barcode found in that photo. Try again, closer and in focus.'
              : unavailable[state]}
          </p>
          <label className={buttonClass('primary', 'cursor-pointer')}>
            Take a photo
            <input
              type='file'
              accept='image/*'
              capture='environment'
              className='sr-only'
              onChange={(e) => void fromPhoto(e.target.files?.[0])}
            />
          </label>
        </div>
      ) : (
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          {/* The frame, everything round it dimmed */}
          <span className='relative h-36 w-72 max-w-[80%] rounded-2xl shadow-[0_0_0_100vmax_rgb(0_0_0/0.45)]'>
            <span className='absolute inset-0 rounded-2xl border-2 border-white/80' />
            {state === 'starting' && (
              <span className='absolute inset-0 grid place-items-center'>
                <Spinner />
              </span>
            )}
          </span>
          <p className='relative mt-8 max-w-xs px-6 text-center text-[0.9375rem] leading-relaxed text-white text-shadow-[0_1px_8px_rgb(0_0_0/0.8)]'>
            Hold the barcode on the back of the book inside the frame.
          </p>
          {torch.can && (
            <IconButton
              aria-label='Light'
              aria-pressed={torch.on}
              onClick={() => void torch.toggle()}
              className={cn(
                // Low down, apart from the frame, so it moves nothing as it
                // shows
                'absolute bottom-10 left-1/2 size-12 -translate-x-1/2 border-white/30 sm:size-12',
                torch.on ? 'bg-white text-black' : 'bg-black/40 text-white',
              )}
            >
              {torch.on ? (
                <Flashlight size={20} />
              ) : (
                <FlashlightOff size={20} />
              )}
            </IconButton>
          )}
        </div>
      )}
    </>
  );
}
