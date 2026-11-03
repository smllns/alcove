import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';
import { isbnFrom } from './isbn';

// What reads a barcode off a picture: the browser's own BarcodeDetector
// isn't in Safari, so one built on zxing for every browser alike, its
// WebAssembly served with the app (not fetched from a CDN), loaded only
// once the camera is first asked for
export type Detector = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

let made: Promise<Detector> | undefined;

export function loadDetector() {
  made ??= import('barcode-detector/ponyfill')
    .then(({ BarcodeDetector, setZXingModuleOverrides }) => {
      setZXingModuleOverrides({
        locateFile: (path: string, prefix: string) =>
          path.endsWith('.wasm') ? wasmUrl : prefix + path,
      });
      return new BarcodeDetector({ formats: ['ean_13'] });
    })
    .catch((error: unknown) => {
      // Tried afresh next time, a dropped connection not kept
      made = undefined;
      throw error;
    });
  return made;
}

// The ISBN of the book whose barcode is in `source` (a frame of the camera,
// a photo), if one is
export async function readIsbn(detector: Detector, source: ImageBitmapSource) {
  const codes = await detector.detect(source).catch(() => []);
  return codes.map((code) => isbnFrom(code.rawValue)).find(Boolean) ?? null;
}

// A book's ISBN read off a photo of its barcode, for when the camera
// can't be watched live; null when none is found
export async function isbnInPhoto(file: File) {
  const [detector, picture] = await Promise.all([
    loadDetector(),
    createImageBitmap(file),
  ]);
  const isbn = await readIsbn(detector, picture);
  picture.close();
  return isbn;
}
