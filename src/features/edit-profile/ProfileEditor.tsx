import type { ReactNode } from 'react';
import { Globe, Lock } from 'lucide-react';
import { updateAbout, updateName, updateUsername } from '@/entities/user/api';
import type { Privacy, User } from '@/entities/user/types';
import { usernameField } from '@/entities/user/usernameField';
import { useAuth } from '@/features/auth';
import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/Button';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { FormError } from '@/shared/ui/FormError';
import { labelClass } from '@/shared/ui/fieldStyles';
import { QuietButton } from '@/shared/ui/ListControls';
import { TextArea } from '@/shared/ui/TextArea';
import { TextField } from '@/shared/ui/TextField';
import { AvatarPicker } from './AvatarPicker';
import { usePrivacy } from './usePrivacy';

const pageChoices: {
  value: Privacy['page'];
  label: string;
  icon: ReactNode;
}[] = [
  { value: 'open', label: 'Open', icon: <Globe size={14} /> },
  { value: 'ask', label: 'Closed', icon: <Lock size={14} /> },
];

// How each of what's typed in is saved, by what the server calls it, so
// its complaints land on the field
const savers = {
  username: updateUsername,
  name: updateName,
  about: updateAbout,
};

// Who the reader is, changed where it's shown, on their own page: their
// photo (changed as it's chosen), username, name and what they say of
// themselves (saved together, only those changed), and whether their page
// is open to everyone or only to those they let follow (saved as it's
// tapped). Closed (`onClose`, where it may be) once saved or let go of.
export function ProfileEditor({
  user,
  onClose,
}: {
  user: User;
  onClose?: () => void;
}) {
  const { replaceUser } = useAuth();
  const { privacy, change, error } = usePrivacy(user);
  const was = {
    username: user.username ?? '',
    name: user.name ?? '',
    about: user.about ?? '',
  };
  const form = useForm(was, async (values) => {
    let saved: User | null = null;
    // The @ is shown before the username already; typed again, let go
    const now = { ...values, username: values.username.replace(/^@+/, '') };
    for (const key of Object.keys(savers) as (keyof typeof savers)[])
      if (now[key].trim() !== was[key]) saved = await savers[key](now[key]);
    if (saved) replaceUser(saved);
    onClose?.();
  });

  return (
    <form
      onSubmit={form.onSubmit}
      noValidate
      className='flex animate-rise flex-col gap-5'
    >
      <AvatarPicker user={user} />
      <TextField
        {...usernameField}
        leading={
          <span aria-hidden className='text-base text-muted'>
            @
          </span>
        }
        placeholder=''
        hint='Letters, numbers and _.'
        {...form.field('username')}
      />
      <TextField
        label='Name'
        autoComplete='name'
        placeholder='Optional'
        {...form.field('name')}
      />
      <TextArea label='About' short {...form.field('about')} />
      <div className='flex flex-col gap-2'>
        <p className={labelClass}>Your page</p>
        <ChoiceCapsule
          label='Your page'
          words
          stretch
          options={pageChoices}
          current={privacy.page}
          onChange={(page) => void change({ page })}
        />
        <FormError message={error} small />
      </div>
      <FormError message={form.formError} />
      <div className='flex items-center gap-4'>
        <Button type='submit' loading={form.status === 'saving'}>
          Save
        </Button>
        {onClose && (
          <QuietButton onClick={onClose} className='text-sm'>
            Cancel
          </QuietButton>
        )}
      </div>
    </form>
  );
}
