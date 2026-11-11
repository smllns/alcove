// A picture chosen in the browser, opened for drawing; one that isn't a
// picture, or can't be opened here, says so
async function opened(file: Blob) {
  if (!file.type.startsWith('image/')) throw new Error('That isn’t a picture.');
  return createImageBitmap(file).catch(() => {
    throw new Error('This picture can’t be opened here. Try a JPEG or PNG.');
  });
}

// The part `rect` of a picture (in its own pixels) drawn `scale` times its
// size and encoded as JPEG
function jpegOf(
  bitmap: ImageBitmap,
  rect: { x: number; y: number; width: number; height: number },
  scale: number,
  quality: number,
) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  const draw = canvas.getContext('2d')!;
  draw.imageSmoothingQuality = 'high';
  draw.drawImage(
    bitmap,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}

// Shrinks a photo in the browser before upload: longest side at most
// `maxSide` px, re-encoded as JPEG. A phone picture of a cover goes from
// several MB to around 150 KB.
export async function shrinkImage(file: Blob, maxSide = 1200, quality = 0.85) {
  const bitmap = await opened(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return jpegOf(bitmap, { x: 0, y: 0, width, height }, scale, quality);
}

// The part `rect` of a photo (in its own pixels) cut out, drawn at most
// `width` px across (sharp even opened to fill a screen) and encoded as
// JPEG: a reader's photo, as they placed it
export async function cropImage(
  file: Blob,
  rect: { x: number; y: number; width: number; height: number },
  width = 1200,
  quality = 0.9,
) {
  const bitmap = await opened(file);
  return jpegOf(bitmap, rect, Math.min(1, width / rect.width), quality);
}
