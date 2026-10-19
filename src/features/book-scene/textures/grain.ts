import * as THREE from 'three';
import { makeCanvas, toTexture } from './canvas';

let grainCanvas: HTMLCanvasElement | null = null;

// Mid-grey noise; overlaid it reads as paper fibre and print grain.
export function getGrainCanvas() {
  if (grainCanvas) return grainCanvas;
  const [canvas, ctx] = makeCanvas(128, 128);
  const image = ctx.createImageData(128, 128);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 104 + Math.random() * 48;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  grainCanvas = canvas;
  return canvas;
}

let grainTexture: THREE.CanvasTexture | null = null;

// Shared bump map: a faint tooth so light doesn't slide across like plastic
export function getGrainTexture() {
  if (grainTexture) return grainTexture;
  grainTexture = toTexture(getGrainCanvas(), false);
  grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
  grainTexture.repeat.set(5, 7);
  return grainTexture;
}
