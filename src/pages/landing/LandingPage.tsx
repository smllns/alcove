import { useCallback, useRef, useState } from 'react';
import { showcaseBooks } from '@/entities/book/showcase';
import { useAuth } from '@/features/auth';
import { BookScene } from '@/features/book-scene';
import { useTheme } from '@/shared/theme';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { LandingFooter } from './LandingFooter';
import { LandingHero } from './LandingHero';
import { Preloader } from './preloader/Preloader';
import { useLandingIntro } from './useLandingIntro';

const covers = showcaseBooks.map((book) => book.cover);

// The preloader plays once per visit; coming back from /login skips it
let preloaderPlayed = false;

export function LandingPage() {
  const { theme } = useTheme();
  const { status } = useAuth();
  const contentRef = useRef<HTMLElement>(null);
  // Remembered at mount: a return visit skips the preloader and the entrance;
  // the curtain lifting is all the motion it needs
  const [returning] = useState(() => preloaderPlayed);
  const [loading, setLoading] = useState(() => !preloaderPlayed);
  const [revealed, setRevealed] = useState(() => preloaderPlayed);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => {
    preloaderPlayed = true;
    setLoading(false);
  }, []);
  useLandingIntro(contentRef, revealed, returning);

  return (
    <main className='bg-paper relative isolate flex min-h-screen flex-col overflow-hidden text-ink'>
      {loading && (
        <Preloader
          covers={covers}
          onReveal={handleReveal}
          onDone={handleDone}
        />
      )}

      {/* Mounted early so shaders compile behind the preloader */}
      <BookScene
        books={showcaseBooks}
        started={revealed}
        entrance={returning ? 'none' : 'slow'}
        theme={theme}
      />

      {/* Page content sits above the 3D scene; only its controls take the pointer */}
      <section
        ref={contentRef}
        className='pointer-events-none relative z-10 flex min-h-screen flex-col'
      >
        <SiteHeader className='site-header'>
          {status === 'signed-in' ? (
            <ButtonLink to='/library' variant='pill' arrow>
              Your library
            </ButtonLink>
          ) : (
            <ButtonLink to='/login' variant='pill' arrow>
              Log in
            </ButtonLink>
          )}
        </SiteHeader>
        <LandingHero />
        <LandingFooter />
      </section>
    </main>
  );
}
