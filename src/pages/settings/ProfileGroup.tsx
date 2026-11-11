import { callName, handle, type User } from '@/entities/user/types';
import { updateAbout, updateName, updateUsername } from '@/entities/user/api';
import { useBooks } from '@/entities/book/queries';
import { usernameField } from '@/entities/user/usernameField';
import { counted } from '@/shared/lib/plural';
import { AvatarPicker } from './AvatarPicker';
import { SettingRow } from './SettingRow';
import { SettingsGroup } from './SettingsGroup';
import { TextSettingForm } from './TextSettingForm';

// Who the reader is in alcove: their circle, what they're called and found
// by, and how many books they keep here
export function ProfileGroup({ user, delay }: { user: User; delay: number }) {
  const total = useBooks().data?.pages[0]?.total;
  const facts = [
    user.name && user.username && handle(user.username),
    total !== undefined && counted(total, 'book'),
  ].filter(Boolean);
  const unset = (text: string) => <span className='text-muted'>{text}</span>;

  return (
    <SettingsGroup
      id='profile'
      title='Profile'
      aside={
        <span className='text-xs text-faint'>How other readers see you</span>
      }
      delay={delay}
    >
      <div className='flex items-center gap-4 border-b border-line/70 px-5 py-5 sm:gap-5 sm:px-6'>
        <AvatarPicker user={user} />
        <div className='min-w-0'>
          <p className='truncate font-serif text-2xl tracking-[-0.02em]'>
            {callName(user) || 'You'}
          </p>
          <p className='mt-0.5 text-[0.8125rem] text-muted'>
            {facts.join(' · ')}
          </p>
        </div>
      </div>
      <SettingRow
        label='Username'
        value={user.username ? handle(user.username) : unset('Not chosen yet')}
      >
        <TextSettingForm
          field='username'
          value={user.username ?? ''}
          save={updateUsername}
          {...usernameField}
        />
      </SettingRow>
      <SettingRow label='Name' value={user.name ?? unset('Not added')}>
        <TextSettingForm
          field='name'
          value={user.name ?? ''}
          save={updateName}
          label='Name'
          autoComplete='name'
          hint='Optional. Shown with your username, if you add it.'
        />
      </SettingRow>
      <SettingRow label='About' value={user.about ?? unset('Not added')}>
        <TextSettingForm
          field='about'
          value={user.about ?? ''}
          save={updateAbout}
          label='About'
          hint='Optional. A line or two on your page: what you read, where.'
        />
      </SettingRow>
    </SettingsGroup>
  );
}
