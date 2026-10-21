import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Eyebrow } from '@/shared/ui/PageHeading';
import './landing.css';
import { paths } from '@/shared/config/paths';

export function LandingHero() {
  return (
    <section className='flex flex-1 items-center justify-center px-6 py-8 text-center sm:px-10 sm:py-16'>
      <div className='text-glow relative w-full max-w-3xl'>
        {/* Frosted glow that lifts the text off the books behind it */}
        <div
          aria-hidden
          className='hero-halo pointer-events-none absolute -inset-x-10 -inset-y-14 -z-10 sm:-inset-x-24 sm:-inset-y-20'
        />

        <Eyebrow className='hero-eyebrow mb-4 font-medium sm:mb-6'>
          Your personal library
        </Eyebrow>

        <h1 className='hero-title font-serif text-[clamp(4rem,12vw,9rem)] leading-[0.9] tracking-[-0.075em]'>
          alcove
        </h1>

        <p className='hero-description mx-auto mt-5 max-w-md text-[15px] leading-6 text-muted sm:mt-8 sm:text-base sm:leading-7'>
          A home for the books you keep,
          <br className='hidden sm:block' /> and the stories that stay with you.
        </p>

        <div className='hero-actions mt-6 flex flex-col items-center justify-center gap-2 sm:mt-10 sm:flex-row sm:gap-3'>
          <ButtonLink to={paths.register} arrow>
            Build your library
          </ButtonLink>
          <ButtonLink to={paths.login} variant='secondary'>
            I already have an account
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
