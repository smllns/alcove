import type { ReactNode } from 'react';
import type { User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { DeleteAccount } from './DeleteAccount';
import { EmailForm } from './EmailForm';
import { LogoutButton } from './LogoutButton';
import { NameForm } from './NameForm';
import { PasswordForm } from './PasswordForm';
import { PlacesSettings } from './PlacesSettings';
import { SettingsSection } from './SettingsSection';

type Section = {
  title: string;
  description: string;
  tone?: 'danger';
  form: (user: User) => ReactNode;
};

// Top to bottom, from what changes most often to what can't be undone
const sections: Section[] = [
  {
    title: 'Profile',
    description: 'The name alcove greets you by.',
    form: (user) => <NameForm user={user} />,
  },
  {
    title: 'Places',
    description:
      'Your homes, their rooms, bookcases and shelves. Every book can be put in one of them.',
    form: () => <PlacesSettings />,
  },
  {
    title: 'Email',
    description: 'Where you log in. We’ll ask for your password to change it.',
    form: (user) => <EmailForm user={user} />,
  },
  {
    title: 'Password',
    description: 'Changing it signs you out everywhere else.',
    form: () => <PasswordForm />,
  },
  {
    title: 'Delete account',
    description:
      'Removes your account and your whole library. This can’t be undone.',
    tone: 'danger',
    form: () => <DeleteAccount />,
  },
];

export function SettingsPage() {
  const { user } = useAuth();
  // Behind RequireAuth, so this only covers the moment of deleting the account
  if (!user) return null;

  return (
    <InnerPage>
      <Eyebrow rise={0}>Settings</Eyebrow>
      <PageTitle rise={80} className='mt-3 sm:mt-4'>
        Your account
      </PageTitle>
      <div
        className='mt-4 mb-10 flex animate-rise flex-wrap items-center gap-x-5 gap-y-3 sm:mt-5 sm:mb-14'
        style={{ animationDelay: '160ms' }}
      >
        <Lead>
          Signed in as <span className='text-ink'>{user.email}</span>
        </Lead>
        <LogoutButton />
      </div>

      {sections.map((section, i) => (
        <SettingsSection
          key={section.title}
          title={section.title}
          description={section.description}
          tone={section.tone}
          // Each one rises in a beat after the one above
          delay={240 + i * 80}
        >
          {section.form(user)}
        </SettingsSection>
      ))}
    </InnerPage>
  );
}
