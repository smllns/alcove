import { Settings } from 'lucide-react';
import { useAuth, useLeaveForHome } from '@/features/auth';
import { Button } from '@/shared/ui/Button';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { iconButtonClass } from '@/shared/ui/buttonStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { SiteHeader } from '@/shared/ui/SiteHeader';

// Placeholder until the real library: proves the session works end to end
export function LibraryPage() {
  const { user, logout } = useAuth();
  const leaveForHome = useLeaveForHome();

  // If the request fails the reader stays signed in, and the landing header shows it
  const onLogout = () => leaveForHome(() => logout().catch(() => {}));

  return (
    <main className='bg-paper flex min-h-screen flex-col text-ink'>
      <SiteHeader>
        <TransitionLink
          to='/settings'
          aria-label='Settings'
          className={iconButtonClass()}
        >
          <Settings
            size={16}
            className='transition-transform duration-700 ease-soft group-hover:rotate-45'
          />
        </TransitionLink>
        <Button variant='pill' onClick={onLogout}>
          Log out
        </Button>
      </SiteHeader>

      <section className='flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center'>
        <Eyebrow rise={0}>Your library</Eyebrow>
        <PageTitle rise={120} size='lg' className='mt-5'>
          Hello, {user?.name}.
        </PageTitle>
        <Lead rise={240} className='mt-6 max-w-sm'>
          Your shelves are empty for now. Soon this is where every book you keep
          will live.
        </Lead>
      </section>
    </main>
  );
}
