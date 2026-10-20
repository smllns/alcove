import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { kindOf, type BookView } from './views/views';

// Where the books are shown. Switching between the sky and the rest, the
// view being left stays a moment on its way out, under the one coming in;
// each kind keeps its own place, so the sky going out is the same sky
// (where the reader left it), not a new one.
export function ViewStage({
  view,
  leaving,
  switched,
  onLeft,
  children,
}: {
  view: BookView;
  leaving: BookView | null;
  // The view came in by such a switch, so it plays its way in
  switched: boolean;
  onLeft: () => void;
  children: (view: BookView) => ReactNode;
}) {
  const shown = leaving ? [leaving, view] : [view];
  return shown.map((each) => {
    const sky = kindOf(each) === 'universe';
    const going = each === leaving;
    return (
      <div
        key={kindOf(each)}
        inert={going}
        aria-hidden={going || undefined}
        onAnimationEnd={(e) => {
          if (going && e.target === e.currentTarget) onLeft();
        }}
        className={cn(
          // The sky is behind the header and the controls, edge to edge;
          // the grid and the list sit over it
          sky
            ? 'pointer-events-auto fixed inset-0 z-0 flex'
            : 'relative z-1 mt-6 sm:mt-8',
          going && 'pointer-events-none',
          going
            ? sky
              ? 'animate-sky-out'
              : 'animate-shelf-out'
            : switched &&
                (sky
                  ? 'motion-safe:animate-sky-in'
                  : 'motion-safe:animate-shelf-in'),
        )}
      >
        {children(each)}
      </div>
    );
  });
}
