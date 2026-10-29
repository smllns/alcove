import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { gsap } from '@/shared/lib/gsap';
import { reducedMotionNow } from '@/shared/lib/motion';
import { PHONE } from '@/shared/lib/useMediaQuery';
import { usePullDown } from '@/shared/lib/usePullDown';

type ModalProps = {
  open: boolean;
  // Escape, or a click on the dimmed page around it
  onClose: () => void;
  // Once it's gone from the screen
  onClosed?: () => void;
  // Where the focus goes as it opens; otherwise the first thing in it
  focus?: RefObject<HTMLElement | null>;
  // Rising a little into place (a dialog); the same, but coming up from
  // the bottom on a phone (a sheet); or sliding in from the right edge (a
  // drawer; from the bottom on a phone). Come up from the bottom, it can be
  // pulled back down by its top (data-grab, and the handle drawn there).
  motion?: 'rise' | 'sheet' | 'slide';
  // The panel itself: how it looks and where it sits. Positioned (fixed,
  // relative), so it's over the dimmed page.
  className?: string;
  children: ReactNode;
};

type Motion = NonNullable<ModalProps['motion']>;
const phone = () => matchMedia(PHONE).matches;
// Whether it comes up from the bottom of the screen, as it is now
const fromBelow = (motion: Motion) => motion !== 'rise' && phone();
// How long it takes to come in or go: longer for one that travels in
// from an edge than for one rising in place
const takes = (motion: Motion, coming: boolean) =>
  fromBelow(motion) || motion === 'slide'
    ? coming
      ? 0.5
      : 0.32
    : coming
      ? 0.35
      : 0.2;
// Where a panel is out of sight, and where it comes to rest
const away = (motion: Motion) =>
  fromBelow(motion)
    ? { yPercent: 100, y: 0 }
    : motion === 'slide'
      ? { xPercent: 100, x: 16 }
      : { opacity: 0, y: 12, scale: 0.98 };
const home = { opacity: 1, y: 0, scale: 1, xPercent: 0, yPercent: 0, x: 0 };

// Anything opened over the whole page, built on <dialog>: the focus stays
// inside while it's open, and goes back where it was once it closes. The
// page behind dims and blurs, and the panel comes and goes with GSAP: the
// same pace in every browser, and no leap over the slow first frame of a
// page blurred behind it (lagSmoothing, shared/lib/gsap). It's closed only
// once it's gone.
export function Modal({
  open,
  onClose,
  onClosed,
  focus,
  motion = 'rise',
  className,
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const pulls = usePullDown(panel, scrim, onClose, () => fromBelow(motion));
  // Read when it's gone, as it is by then
  const closed = useRef(onClosed);
  useEffect(() => {
    closed.current = onClosed;
  });
  // What's playing now, coming or going, stopped for whatever's next
  const playing = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    const [dim, box] = [scrim.current, panel.current];
    if (!dialog || !dim || !box) return;
    const pace = reducedMotionNow() ? 0 : 1;
    if (!open && !dialog.open) return;
    playing.current?.kill();

    if (open) {
      // Opened again while going, it comes back from where it got to
      if (!dialog.open) {
        // Taking the focus where it comes to rest, not out of sight: a
        // phone would move the whole page to bring it into view. Come up
        // from below, the panel itself takes it, not a field in it, so no
        // keyboard pushes the page up while it travels; the field is
        // tapped when wanted.
        const below = fromBelow(motion);
        gsap.set(box, home);
        box.toggleAttribute('autofocus', below);
        dialog.showModal();
        if (!below) focus?.current?.focus();
        gsap.set(dim, { opacity: 0 });
        gsap.set(box, away(motion));
      }
      playing.current = gsap
        .timeline()
        .to(dim, { opacity: 1, duration: 0.35 * pace, ease: 'power2.out' }, 0)
        .to(
          box,
          {
            ...home,
            duration: takes(motion, true) * pace,
            ease: 'power3.out',
          },
          0,
        );
      return;
    }
    // The panel goes, and the page behind brightens along with it, done
    // just after it
    const going = takes(motion, false) * pace;
    playing.current = gsap
      .timeline({
        onComplete: () => {
          dialog.close();
          // The page never scrolls the window itself (each page scrolls in a
          // box of its own); one a phone moved for a keyboard goes back,
          // or what's under it no longer takes a tap where it's seen
          if (window.scrollY) window.scrollTo(0, 0);
          closed.current?.();
        },
      })
      .to(box, { ...away(motion), duration: going, ease: 'power2.in' }, 0)
      .to(
        dim,
        { opacity: 0, duration: going + 0.06 * pace, ease: 'power1.inOut' },
        0,
      );
  }, [open, focus, motion]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className='fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent open:grid'
    >
      <div
        ref={scrim}
        aria-hidden
        onClick={onClose}
        className='fixed inset-0 bg-ink/30 opacity-0 backdrop-blur-[2px]'
      />
      <div
        ref={panel}
        tabIndex={-1}
        {...pulls}
        className={cn('opacity-0 outline-none', className)}
      >
        {motion !== 'rise' && (
          // What it's pulled down by, on a phone
          <span
            data-grab
            aria-hidden
            className='absolute inset-x-0 top-0 z-10 flex h-5 touch-none justify-center pt-2 sm:hidden'
          >
            <span className='h-1 w-9 rounded-full bg-ink/20' />
          </span>
        )}
        {children}
      </div>
    </dialog>
  );
}
