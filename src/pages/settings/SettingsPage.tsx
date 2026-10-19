import { useAuth } from '@/features/auth';
import { BackLink } from '@/shared/ui/BackLink';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { DeleteAccount } from './DeleteAccount';
import { EmailForm } from './EmailForm';
import { NameForm } from './NameForm';
import { PasswordForm } from './PasswordForm';
import { SettingsSection } from './SettingsSection';

export function SettingsPage() {
  const { user } = useAuth();
  // Behind RequireAuth, so this only covers the moment of deleting the account
  if (!user) return null;

  return (
    <main className='bg-paper min-h-screen text-ink'>
      <SiteHeader>
        <ButtonLink to='/library' variant='pill'>
          Your library
        </ButtonLink>
      </SiteHeader>

      <div className='mx-auto w-full max-w-3xl px-6 pb-24 pt-4 sm:px-10 sm:pt-10'>
        <BackLink to='/library' />
        <Eyebrow rise={0}>Settings</Eyebrow>
        <PageTitle rise={80} className='mt-3 sm:mt-4'>
          Your account
        </PageTitle>
        <Lead rise={160} className='mt-4 mb-10 sm:mt-5 sm:mb-14'>
          Signed in as <span className='text-ink'>{user.email}</span>
        </Lead>

        <SettingsSection
          title='Profile'
          description='The name alcove greets you by.'
          delay={240}
        >
          <NameForm user={user} />
        </SettingsSection>

        <SettingsSection
          title='Email'
          description='Where you log in. We’ll ask for your password to change it.'
          delay={320}
        >
          <EmailForm user={user} />
        </SettingsSection>

        <SettingsSection
          title='Password'
          description='Changing it signs you out everywhere else.'
          delay={400}
        >
          <PasswordForm />
        </SettingsSection>

        <SettingsSection
          title='Delete account'
          description='Removes your account and your whole library. This can’t be undone.'
          tone='danger'
          delay={480}
        >
          <DeleteAccount />
        </SettingsSection>
      </div>
    </main>
  );
}
