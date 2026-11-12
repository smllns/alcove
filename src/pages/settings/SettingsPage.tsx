import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useReadingAt } from '@/shared/lib/useReadingAt';
import { PageContents } from '@/shared/ui/PageContents';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { BackToTop } from '@/shared/ui/BackToTop';
import { BackLink } from '@/shared/ui/BackLink';
import { InnerPage } from '@/shared/ui/InnerPage';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { DeleteAccount } from './DeleteAccount';
import { LibrarySettings } from './LibrarySettings';
import { PlacesSettings } from './PlacesSettings';
import { ProfileGroup } from './ProfileGroup';
import { rowLinkClass } from './rowLink';
import { SettingsGroup } from './SettingsGroup';
import { SignInGroup } from './SignInGroup';
import { ThemeChoice } from './ThemeChoice';

// In the order they're shown, from what changes most often to what can't
// be undone
const groups = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'places', label: 'Places' },
  { id: 'library', label: 'Library' },
  { id: 'sign-in', label: 'Sign-in' },
  { id: 'leaving', label: 'Leaving', danger: true },
];
// For alcove's team, its news too, after the profile
const forTeam = [groups[0], { id: 'news', label: 'News' }, ...groups.slice(1)];
// Each group rises in a beat after the one above
const delay = (i: number) => 160 + i * 80;

// The account's settings: on a wide screen, the way back, the title and an
// index of the groups stay on the left as the groups go by on the right
export function SettingsPage() {
  const { user } = useAuth();
  // The title: the way back up shows once it's scrolled away
  const [top, setTop] = useState<HTMLElement | null>(null);
  const parts = user?.admin ? forTeam : groups;
  const [shown, goTo] = useReadingAt(parts.map(({ id }) => id));
  // Opened at one of the groups (#places, say, from elsewhere), there
  // from the first look
  const { hash } = useLocation();
  useLayoutEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  // Behind RequireAuth, so this only covers the moment of deleting the account
  if (!user) return null;

  return (
    <InnerPage width='wide' backBeside>
      <div className='grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16 xl:gap-24'>
        <div className='lg:sticky lg:top-10 lg:self-start'>
          {/* Staying with the index as the groups go by */}
          <div className='hidden lg:block'>
            <BackLink to={paths.library} returns />
          </div>
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
            <PageContents
              label='Settings'
              parts={parts}
              shown={shown}
              onGo={goTo}
            />
          </div>
        </div>

        <div className='flex min-w-0 flex-col gap-10'>
          <ProfileGroup user={user} delay={delay(0)} />
          {user.admin && (
            <SettingsGroup
              id='news'
              title='News'
              aside={
                <TransitionLink to={paths.news} className={rowLinkClass}>
                  Write news →
                </TransitionLink>
              }
              delay={delay(0)}
            >
              <p className='px-5 py-4 text-sm leading-relaxed text-muted sm:px-6'>
                What you write there goes to every reader’s feed.
              </p>
            </SettingsGroup>
          )}
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
          <SettingsGroup id='library' title='Library' delay={delay(3)}>
            <LibrarySettings />
          </SettingsGroup>
          <SignInGroup user={user} delay={delay(4)} />
          <DeleteAccount id='leaving' delay={delay(5)} />
        </div>
      </div>
      <BackToTop after={top} />
    </InnerPage>
  );
}
