import type { User } from '@/entities/user/types';
import { EmailForm } from './EmailForm';
import { LogoutButton } from './LogoutButton';
import { PasswordForm } from './PasswordForm';
import { SettingRow } from './SettingRow';
import { SettingsGroup } from './SettingsGroup';

// How the reader gets in: where, with what, and out again
export function SignInGroup({ user, delay }: { user: User; delay: number }) {
  return (
    <SettingsGroup id='sign-in' title='Sign-in' delay={delay}>
      <SettingRow label='Email' value={user.email}>
        <EmailForm user={user} />
      </SettingRow>
      <SettingRow
        label='Password'
        value={<span className='tracking-[0.2em] text-muted'>••••••••</span>}
      >
        <PasswordForm />
      </SettingRow>
      <SettingRow
        label='Session'
        value={<span className='text-muted'>Signed in on this device</span>}
        action={<LogoutButton />}
      />
    </SettingsGroup>
  );
}
