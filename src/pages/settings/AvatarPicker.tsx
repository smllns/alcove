import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { uploadCover } from '@/entities/book/api';
import { useUploadsEnabled } from '@/entities/book/queries';
import { updateAvatar } from '@/entities/user/api';
import { callName, type User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';

import { Avatar } from '@/shared/ui/Avatar';
import { FormError } from '@/shared/ui/FormError';
import { Spinner } from '@/shared/ui/Spinner';
import { AvatarCropper } from './AvatarCropper';
import { rowLinkClass } from './rowLink';

// The reader's circle, their photo in it if they've one: tapped, a photo
// from their device, placed in the circle (AvatarCropper) and uploaded, in
// its place; "Remove" takes it away, their initial back. Without uploads
// set up, only the circle.
export function AvatarPicker({ user }: { user: User }) {
  const { replaceUser } = useAuth();
  const enabled = useUploadsEnabled();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The photo being placed, kept as its dialog closes
  const [file, setFile] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      replaceUser(await updateAvatar(null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t work.');
    } finally {
      setBusy(false);
    }
  };
  const choose = (chosen: File) => {
    setFile(chosen);
    setPlacing(true);
  };
  const circle = (
    <Avatar name={callName(user)} url={user.avatarUrl} size='lg' />
  );
  if (!enabled) return circle;
  return (
    <div className='flex shrink-0 flex-col items-center gap-1.5'>
      <button
        type='button'
        aria-label='Change your photo'
        disabled={busy}
        onClick={() => input.current?.click()}
        className='group relative cursor-pointer rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink'
      >
        {circle}
        <span className='absolute inset-0 grid place-items-center rounded-full bg-ink/45 text-surface opacity-0 transition-opacity duration-500 ease-soft group-hover:opacity-100 group-focus-visible:opacity-100'>
          {busy ? <Spinner /> : <Camera size={18} />}
        </span>
      </button>
      {user.avatarUrl && (
        <button
          type='button'
          disabled={busy}
          onClick={() => void remove()}
          className={`${rowLinkClass} text-xs`}
        >
          Remove
        </button>
      )}
      <input
        ref={input}
        type='file'
        accept='image/*'
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) choose(file);
        }}
      />
      <FormError message={error} small className='max-w-40 text-center' />
      <AvatarCropper
        open={placing}
        file={file}
        onCancel={() => setPlacing(false)}
        onSave={async (image) => {
          replaceUser(await updateAvatar(await uploadCover(image)));
          setPlacing(false);
        }}
      />
    </div>
  );
}
