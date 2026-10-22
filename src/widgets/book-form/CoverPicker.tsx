import { useRef, useState } from 'react';
import { ImageUp, Link, X } from 'lucide-react';
import { useUploadsEnabled } from '@/entities/book/queries';
import { liftedCover } from '@/entities/book/coverImage';
import type { BookCover as Cover } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';
import { catalogueCover } from './catalogue';
import { CoverLinkField } from './CoverLinkField';
import { thumb, ThumbButton } from './CoverThumb';
import { useCoverUpload } from './useCoverUpload';
import { FormError } from '@/shared/ui/FormError';

type CoverPickerProps = {
  title: string;
  author?: string;
  cover?: Cover;
  // Covers from the catalogue to choose between
  options: string[];
  onChange: (cover: Cover | undefined) => void;
  // Show the ways to change it on a narrow screen too. Off on the second
  // step, where on a phone they'd only push the form further down; a wide
  // screen has room for them beside the form either way.
  choosing?: boolean;
};

// The chosen cover large, with alternatives from other editions, and ways
// to use your own: a photo, or a picture from a link
export function CoverPicker({
  title,
  author,
  cover,
  options,
  onChange,
  choosing = true,
}: CoverPickerProps) {
  const uploadsEnabled = useUploadsEnabled();
  const fileInput = useRef<HTMLInputElement>(null);
  const [linking, setLinking] = useState(false);
  const upload = useCoverUpload(cover, onChange);
  // The link the cover was last taken from. While that's still the cover,
  // the link stays chosen and on show, marked as added.
  const [linked, setLinked] = useState<{ cover: string; link: string }>();
  const addedLink = linked && linked.cover === cover?.url ? linked.link : null;

  const onLink = async (link: string) => {
    const url = await upload.fromLink(link);
    if (url) setLinked({ cover: url, link });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLinking(false);
    await upload.fromFile(file);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div className='flex flex-col items-center lg:items-stretch'>
      <div className='relative w-48 sm:w-56 lg:w-full'>
        <BookCover
          key={cover?.url ?? 'none'}
          title={title || 'Untitled'}
          author={author}
          url={cover?.url}
          size='L'
          className={liftedCover}
        />
        {upload.busy && (
          <div className='absolute inset-0 grid place-items-center rounded-[3px] bg-surface/70 text-ink backdrop-blur-sm'>
            <Spinner />
          </div>
        )}
      </div>

      {/* On a phone, only while choosing; coming and going softly as the
          steps of a book being changed switch (.cover-choices,
          transitions.css) */}
      <div
        className={cn(
          'cover-choices w-full flex-col items-center lg:flex lg:items-stretch',
          choosing ? 'flex' : 'hidden',
        )}
      >
        <div className='mt-5 flex max-w-full flex-wrap justify-center gap-2.5 lg:justify-start'>
          {options.map((url) => (
            <button
              key={url}
              type='button'
              onClick={() => upload.choose(catalogueCover(url))}
              aria-label='Use this cover'
              className={cn(
                thumb,
                cover?.url === url ? 'ring-2 ring-ink' : 'ring-0',
              )}
            >
              <BookCover title={title} url={url} size='S' />
            </button>
          ))}
          {uploadsEnabled && (
            <>
              <ThumbButton
                label='Upload your own photo'
                dashed
                chosen={cover?.source === 'upload' && !addedLink}
                onClick={() => fileInput.current?.click()}
              >
                <ImageUp size={16} />
              </ThumbButton>
              <ThumbButton
                label='Use a picture from a link'
                dashed
                chosen={linking || Boolean(addedLink)}
                onClick={() => {
                  setLinking((open) => !open);
                  upload.clearError();
                }}
              >
                <Link size={15} />
              </ThumbButton>
            </>
          )}
          {cover && (
            <ThumbButton
              label='No cover'
              onClick={() => upload.choose(undefined)}
            >
              <X size={16} />
            </ThumbButton>
          )}
        </div>

        <div className='w-full max-w-sm lg:max-w-none'>
          <CoverLinkField
            open={linking}
            busy={upload.busy}
            error={linking ? upload.error : null}
            added={addedLink}
            onSubmit={onLink}
            onClose={() => setLinking(false)}
          />
        </div>

        <input
          ref={fileInput}
          type='file'
          accept='image/*'
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {!linking && (
          <FormError message={upload.error} small className='mt-3' />
        )}
      </div>
    </div>
  );
}
