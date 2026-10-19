import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion, wait } from '@/shared/lib/motion';
import { loadCovers } from './loadCovers';
import { PhraseTicker } from './PhraseTicker';
import { WordmarkFill, type WordmarkFillHandle } from './WordmarkFill';

// Long enough to enjoy the letters filling up, even when covers are cached
const MIN_DURATION = 2600;
// A slow cover shouldn't hold the door shut
const COVER_TIMEOUT = 8000;

const PHRASES = [
  'Dusting off the shelves',
  'Gathering your books',
  'Arranging by colour',
  'Finding your bookmark',
  'Opening the doors',
];

type PreloaderProps = {
  covers: string[];
  // Fires as the curtain starts lifting, so the page can animate in underneath
  onReveal: () => void;
  onDone: () => void;
};

// Full-screen curtain: the wordmark fills with covers as they load, settles
// into ink, then the whole screen lifts away.
export function Preloader({ covers, onReveal, onDone }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<WordmarkFillHandle>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const word = wordRef.current;
    if (!root || !word) return;

    let cancelled = false;
    const progress = { value: 0 };

    const ctx = gsap.context(() => {
      gsap.from('.preloader-frame', {
        opacity: 0,
        y: 10,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, root);

    // Percent, eased so the level never jumps
    const setProgress = (target: number, duration: number) =>
      gsap.to(progress, {
        value: target,
        duration,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: () => {
          word.setLevel(progress.value / 100);
          if (counterRef.current) {
            counterRef.current.textContent = String(
              Math.round(progress.value),
            ).padStart(3, '0');
          }
        },
      });

    // A little fill straight away, so the word never looks empty;
    // the last stretch waits for the minimum time
    ctx.add(() => setProgress(8, 1.4));
    const loading = loadCovers(covers, {
      timeout: COVER_TIMEOUT,
      onEach: (loaded, total) => {
        if (!cancelled)
          ctx.add(() => setProgress(8 + (loaded / total) * 74, 1.6));
      },
    });

    Promise.all([
      loading,
      wait(prefersReducedMotion ? 300 : MIN_DURATION),
    ]).then(() => {
      if (cancelled) return;

      ctx.add(() => {
        gsap
          .timeline({ onComplete: onDone })
          .add(setProgress(100, 1))
          .add(word.settle(), '-=0.15')
          .to(
            '.preloader-frame',
            { opacity: 0, y: -12, duration: 0.6, ease: 'power3.in' },
            '+=0.2',
          )
          .add(word.leave(), '<0.1')
          .call(onReveal, [], '-=0.25')
          .to(root, { yPercent: -100, duration: 1.5, ease: 'expo.inOut' }, '<');
      });
    });

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [covers, onReveal, onDone]);

  const label = 'text-[10px] uppercase tracking-[0.24em] text-faint';

  return (
    <div
      ref={rootRef}
      role='status'
      aria-label='Loading your library'
      className='bg-paper fixed inset-0 z-50 flex flex-col overflow-hidden text-ink shadow-[0_30px_60px_-20px_rgba(74,58,36,0.25)]'
    >
      <div
        className={`preloader-frame flex justify-between px-5 pt-6 sm:px-10 sm:pt-8 lg:px-16 ${label}`}
      >
        <span>Your personal library</span>
        <span>Est. 2026</span>
      </div>

      <div className='flex flex-1 items-center justify-center px-4'>
        <WordmarkFill ref={wordRef} word='alcove' covers={covers} />
      </div>

      <div
        className={`preloader-frame flex items-end justify-between px-5 pb-6 sm:px-10 sm:pb-8 lg:px-16 ${label}`}
      >
        <PhraseTicker phrases={PHRASES} />
        <span
          ref={counterRef}
          className='font-serif text-2xl tracking-normal tabular-nums text-ink'
        >
          000
        </span>
      </div>
    </div>
  );
}
