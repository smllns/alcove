import { useAuth } from '@/features/auth';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { ThemeToggle } from '@/shared/theme';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { paths } from '@/shared/config/paths';

export function NotFoundPage() {
  // Signed in, the way back is to the library rather than the start page
  const { user } = useAuth();
  const home = user ? paths.library : paths.home;
  return (
    <main className='bg-paper flex min-h-screen flex-col text-ink'>
      <SiteHeader home={home}>{!user && <ThemeToggle />}</SiteHeader>
      <section className='flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center'>
        <Eyebrow rise={0}>404</Eyebrow>
        <PageTitle rise={120} className='mt-5'>
          This page is out on loan.
        </PageTitle>
        <div className='mt-10 animate-rise' style={{ animationDelay: '240ms' }}>
          <ButtonLink to={home} arrow>
            {user ? 'Back to your books' : 'Back to the start'}
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
