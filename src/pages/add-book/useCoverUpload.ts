import { useState } from 'react';
import {
  discardCover,
  fetchCoverFromLink,
  uploadCover,
} from '@/entities/book/api';
import type { BookCover } from '@/entities/book/types';
import { shrinkImage } from '@/shared/lib/image';

// The reader's own cover: a photo from their device or a picture from a
// link, shrunk in the browser either way, then uploaded. A photo they swap
// for another cover is thrown away, so storage keeps only what books use.
export function useCoverUpload(
  cover: BookCover | undefined,
  onChange: (cover: BookCover | undefined) => void,
) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = (next: BookCover | undefined) => {
    if (cover?.source === 'upload' && next?.url !== cover.url)
      void discardCover(cover.url).catch(() => {});
    onChange(next);
  };

  // The cover's address once the picture is the cover, or null
  const upload = async (picture: () => Promise<Blob>) => {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadCover(await shrinkImage(await picture()));
      choose({ url, source: 'upload' });
      return url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'That picture didn’t work.',
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    error,
    clearError: () => setError(null),
    choose,
    fromFile: (file: Blob) => upload(async () => file),
    fromLink: (url: string) => upload(() => fetchCoverFromLink(url)),
  };
}
