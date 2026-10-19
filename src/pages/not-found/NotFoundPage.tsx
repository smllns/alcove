import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';

export function NotFoundPage() {
  return (
    <main className='bg-paper flex min-h-screen flex-col text-ink'>
      <SiteHeader />
      <section className='flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center'>
        <Eyebrow rise={0}>404</Eyebrow>
        <PageTitle rise={120} className='mt-5'>
          This page is out on loan.
        </PageTitle>
        <div className='mt-10 animate-rise' style={{ animationDelay: '240ms' }}>
          <ButtonLink to='/' arrow>
            Back to the start
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
