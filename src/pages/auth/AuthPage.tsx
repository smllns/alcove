import { Link, useMatch } from 'react-router';
import { BackLink } from '@/shared/ui/BackLink';
import { buttonClass, textLinkClass } from '@/shared/ui/buttonStyles';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { ThemeToggle } from '@/shared/theme';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { Typewriter } from '@/shared/ui/Typewriter';
import { authCopy, type AuthMode } from './authCopy';
import { AuthForm } from './AuthForm';
import { CoverFan } from './CoverFan';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';

// Log in and sign up are one screen that changes in place: the covers
// reshuffle, the words retype themselves, and the form grows or loses a field.
// Lines retype top to bottom, this far apart:
const STAGGER = 90;
export function AuthPage() {
  const mode: AuthMode = useMatch(paths.register) ? 'register' : 'login';
  const copy = authCopy[mode];

  const rise = (delay: number) => ({ animationDelay: `${delay}ms` });

  return (
    <main className='bg-paper flex min-h-screen flex-col overflow-x-clip text-ink'>
      <SiteHeader>
        <ThemeToggle />
        <Link to={copy.switchTo} className={buttonClass('pill')}>
          <Typewriter text={copy.headerSwitch} />
        </Link>
      </SiteHeader>

      <div className='mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-6 pb-8 pt-3 sm:pb-12 sm:px-10 sm:pt-6 lg:items-center lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-24 lg:px-16'>
        {/* Only on wide screens, beside the form */}
        <div className='hidden animate-rise justify-center lg:flex'>
          <CoverFan mode={mode} />
        </div>

        <section className='mx-auto w-full max-w-sm lg:mx-0'>
          <BackLink to={paths.home} />

          <Eyebrow rise={80}>
            <Typewriter text={copy.eyebrow} />
          </Eyebrow>

          <PageTitle rise={160} className='mt-3 sm:mt-4'>
            {/* The break is fixed so the title keeps two lines while the verb retypes */}
            <Typewriter text={copy.titleVerb} delay={STAGGER} pace={3.2} /> your
            <br />
            library
          </PageTitle>

          <Lead rise={240} className='mt-4 sm:mt-5'>
            <Typewriter text={copy.lead} delay={STAGGER * 2} />
          </Lead>

          <div className='mt-8 animate-rise sm:mt-10' style={rise(320)}>
            <AuthForm mode={mode} typeDelay={STAGGER * 3} />
          </div>

          <p
            className='mt-7 animate-rise text-sm text-muted sm:mt-8'
            style={rise(400)}
          >
            <Typewriter text={copy.switchPrompt} delay={STAGGER * 4} />{' '}
            <Link to={copy.switchTo} className={cn('text-ink', textLinkClass)}>
              <Typewriter text={copy.switchLink} delay={STAGGER * 4} />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
