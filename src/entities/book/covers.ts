import * as THREE from 'three';

// Shared cover cache: the preloader warms it, the 3D books paint from it.
const loader = new THREE.ImageLoader();
const images = new Map<string, HTMLImageElement>();
const requests = new Map<string, Promise<HTMLImageElement | null>>();

export function getCachedCover(cover: string) {
  return images.get(cover) ?? null;
}

// Resolves with null if the cover fails, so callers can keep the fallback.
export function loadCover(cover: string) {
  let request = requests.get(cover);

  if (!request) {
    request = new Promise((resolve) => {
      loader.load(
        cover,
        (image) => {
          images.set(cover, image);
          resolve(image);
        },
        undefined,
        () => resolve(null),
      );
    });
    requests.set(cover, request);
  }

  return request;
}
