import { useState } from 'react';

// The light by the camera, for a barcode in the dark: whether this camera
// has one the browser can turn on (Chrome on Android does; Safari only in
// later versions), whether it's on, and a way to turn it on and off. It
// goes off of itself as the camera stops.
export function useTorch(track?: MediaStreamTrack) {
  const [on, setOn] = useState(false);
  const capabilities = track?.getCapabilities?.() as
    (MediaTrackCapabilities & { torch?: boolean }) | undefined;
  const toggle = async () => {
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !on } as MediaTrackConstraintSet],
      });
      setOn(!on);
    } catch {
      // Refused after all: left as it was
    }
  };
  return { can: Boolean(capabilities?.torch), on, toggle };
}
