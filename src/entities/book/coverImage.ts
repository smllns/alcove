// Open Library serves each cover in three sizes; ask for the one we need
export type CoverSize = 'S' | 'M' | 'L';

export const sizedCover = (url: string, size: CoverSize) =>
  url.includes('covers.openlibrary.org')
    ? url.replace(/-[SML]\.jpg$/, `-${size}.jpg`)
    : url;

// Warm, muted cloth colours for books without a picture, picked by title so a
// book always gets the same one
const cloths = [
  '#7b4837',
  '#5a6870',
  '#6f5947',
  '#8d7762',
  '#4f5b4a',
  '#7a5a6b',
  '#3f4a5c',
  '#8a6a3f',
];

export function clothFor(title: string) {
  let hash = 0;
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return cloths[Math.abs(hash) % cloths.length];
}
