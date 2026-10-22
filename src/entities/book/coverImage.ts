// Open Library serves each cover in three sizes; ask for the one we need
export type CoverSize = 'S' | 'M' | 'L';

export const sizedCover = (url: string, size: CoverSize) =>
  url.includes('covers.openlibrary.org')
    ? url.replace(/-[SML]\.jpg$/, `-${size}.jpg`)
    : url;

// Pictures already loaded once on this visit: shown again at once, without
// fading in a second time (from one view of the library to another, or
// from the shelves to a book's page, its light and all)
const seen = new Set<string>();
export const coverSeen = (src: string) => seen.has(src);
export const markCoverSeen = (src: string) => void seen.add(src);

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

// The shadow under a cover shown large, as if held up off the page
export const liftedCover =
  'shadow-[0_30px_50px_-24px_rgb(var(--shade)/calc(0.55*var(--shade-k))),0_3px_8px_rgb(var(--shade)/calc(0.15*var(--shade-k)))]';
