import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { loadDetector, readIsbn } from './detector';

// How often a frame is looked at for a barcode
const EVERY_MS = 120;

// Starting, watching for a barcode, or why the camera can't be had: the
// page isn't on a secure connection (a browser then never even asks),
// it's not allowed, there's none, or it or the reader didn't start
export type CameraState =
  'starting' | 'looking' | 'insecure' | 'denied' | 'missing' | 'broken';

// Why a camera asked for wasn't had, by the error the browser gave
const whyNot = (error: unknown): CameraState => {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'missing';
  return 'broken';
};

// The back camera, shown in the video it gives, each frame or so read for
// a book's barcode until one's found (`onFound`, a short buzz with it);
// otherwise why not (CameraState). Asked for before the reader is ready,
// so the browser asks at once. Stopped, the light going off, once the one
// using it is gone.
export function useBarcodeCamera(onFound: (isbn: string) => void) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>('starting');
  // The camera's picture, once it's showing, for its light (useTorch)
  const [track, setTrack] = useState<MediaStreamTrack>();
  const found = useEffectEvent((isbn: string) => {
    navigator.vibrate?.(40);
    onFound(isbn);
  });

  useEffect(() => {
    const el = video.current;
    let stream: MediaStream | undefined;
    let timer = 0;
    let stopped = false;
    const start = async () => {
      if (!window.isSecureContext || !navigator.mediaDevices) {
        setState('insecure');
        return;
      }
      const reader = loadDetector();
      // Waited for only once the camera's had
      reader.catch(() => {});
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch (error) {
        if (!stopped) setState(whyNot(error));
        return;
      }
      try {
        const detector = await reader;
        if (stopped || !el) return;
        el.srcObject = stream;
        await el.play();
        setState('looking');
        setTrack(stream.getVideoTracks()[0]);
        const look = async () => {
          if (stopped) return;
          const isbn = el.readyState >= 2 ? await readIsbn(detector, el) : null;
          if (isbn && !stopped) found(isbn);
          else timer = window.setTimeout(look, EVERY_MS);
        };
        void look();
      } catch {
        if (!stopped) setState('broken');
      }
    };
    void start();
    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (el) el.srcObject = null;
    };
  }, []);

  return { video, state, track };
}
