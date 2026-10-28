import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { BackToTop } from '@/shared/ui/BackToTop';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { DeleteAccount } from './DeleteAccount';
import { PlacesSettings } from './PlacesSettings';
import { ProfileGroup } from './ProfileGroup';
import { rowLinkClass } from './rowLink';
import { SettingsGroup } from './SettingsGroup';
import { SettingsIndex } from './SettingsIndex';
import { SignInGroup } from './SignInGroup';
import { ThemeChoice } from './ThemeChoice';

// In the order they're shown, from what changes most often to what can't
// be undone
const groups = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'places', label: 'Places' },
  { id: 'sign-in', label: 'Sign-in' },
  { id: 'leaving', label: 'Leaving', danger: true },
];
// Each group rises in a beat after the one above
const delay = (i: number) => 160 + i * 80;

// The account's settings: on a wide screen, the title and an index of the
// groups stay on the left as the groups go by on the right
export function SettingsPage() {
  const { user } = useAuth();
  // The title: the way back up shows once it's scrolled away
  const [top, setTop] = useState<HTMLElement | null>(null);
  // Behind RequireAuth, so this only covers the moment of deleting the account
  if (!user) return null;

  return (
    <InnerPage width='wide'>
      <div className='grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16 xl:gap-24'>
        <div className='lg:sticky lg:top-10 lg:self-start'>
          <Eyebrow rise={0}>Settings</Eyebrow>
          <div ref={setTop}>
            <PageTitle rise={80} size='sm' className='mt-3 sm:mt-4'>
              Your account
            </PageTitle>
          </div>
          <div
            className='mt-8 animate-rise max-lg:hidden'
            style={{ animationDelay: '160ms' }}
          >
            <SettingsIndex groups={groups} />
          </div>
        </div>

        <div className='flex min-w-0 flex-col gap-10'>
          <ProfileGroup user={user} delay={delay(0)} />
          <SettingsGroup id='appearance' title='Appearance' delay={delay(1)}>
            <ThemeChoice />
          </SettingsGroup>
          <SettingsGroup
            id='places'
            title='Places'
            aside={
              <TransitionLink to={paths.places} className={rowLinkClass}>
                Open in Places →
              </TransitionLink>
            }
            delay={delay(2)}
          >
            <PlacesSettings />
          </SettingsGroup>
          <SignInGroup user={user} delay={delay(3)} />
          <DeleteAccount id='leaving' delay={delay(4)} />
        </div>
      </div>
      <BackToTop after={top} />
    </InnerPage>
  );
}
