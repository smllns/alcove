// Shrinks a photo in the browser before upload: longest side at most
// `maxSide` px, re-encoded as JPEG. A phone picture of a cover goes from
// several MB to around 150 KB.
export async function shrinkImage(file: Blob, maxSide = 1200, quality = 0.85) {
  if (!file.type.startsWith('image/')) throw new Error('That isn’t a picture.');
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('This picture can’t be opened here. Try a JPEG or PNG.');
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
