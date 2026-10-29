import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { paths } from '@/shared/config/paths';
import { pageBefore } from '@/shared/lib/pageBefore';
import { cubicBezier } from '@/shared/lib/easing';
import { foldMotion } from '@/shared/lib/foldMotion';

// How many rows show at first, how many more come at a time, and how long
// the grid takes to open or close, as long text folds (Fold)
const FIRST_ROWS = 3;
const PAGE = 48;
const FOLD_MS = 700;
const foldEase = cubicBezier(0.45, 0, 0.2, 1);

// How far each grid was opened, by the visit to its page (its place in
// the history): come back to from a book opened from it, it's as it was
// left, and the page can go back to where it was scrolled; come to any
// other way, it starts folded
const opened = new Map<string, number>();
const fromBook = () =>
  [paths.book(''), paths.work('')].some((at) => pageBefore().startsWith(at));

// A grid of `total` covers (and `more` still to come) shown a few rows at
// first, then a few dozen more at a time, whole rows only, the last only
// halfway down (`box`, its frame, `count` of them shown): opened down over the
// next few dozen, and closed again all the way up to the first rows, the covers
// gone only once they're out of sight. Either way it moves as long text folds
// (foldMotion); closing, what's under it (the ways to open and close it) held
// where it is on the screen.
export function useGridFold(total: number, more?: () => void) {
  const box = useRef<HTMLDivElement>(null);
  // How many are asked to show, past the first few rows; none, at first
  const visit = useLocation().key;
  const back = useNavigationType() === 'POP';
  const [shown, setShown] = useState<number | null>(() =>
    back && fromBook() ? (opened.get(visit) ?? null) : null,
  );
  useEffect(() => {
    if (shown === null) opened.delete(visit);
    else opened.set(visit, shown);
  }, [visit, shown]);
  // How many covers a row holds, as the grid's laid out
  const [columns, setColumns] = useState(1);
  const limit = shown ?? columns * FIRST_ROWS;
  const folded = limit < total || more !== undefined;
  const whole = (n: number) => Math.max(columns, n - (n % columns));
  const count = folded ? whole(Math.min(limit, total)) : total;
  const first = Math.min(whole(Math.min(columns * FIRST_ROWS, total)), count);
  // Opening, from how tall it was; and the opening or closing under way
  const opening = useRef<number | null>(null);
  const moving = useRef<() => void>(undefined);

  const move = (
    from: number,
    to: number,
    closing: boolean,
    done?: () => void,
  ) => {
    const frame = box.current!;
    moving.current?.();
    moving.current = foldMotion({
      at: frame,
      closing,
      // Closing, what's under it stays under the pointer; opening, the
      // page holds still and the grid grows on down
      hold: closing ? frame.nextElementSibling : undefined,
      ms: FOLD_MS,
      ease: foldEase,
      frame: (p) => (frame.style.height = `${from + (to - from) * p}px`),
      done: () => {
        moving.current = undefined;
        done?.();
      },
    });
  };

  // The frame as tall as the grid, or halfway down its last row with more
  // to come: there at once, or opened to after asking for more
  useLayoutEffect(() => {
    const frame = box.current;
    const grid = frame?.firstElementChild;
    if (!frame || !grid) return;
    const fit = () => {
      setColumns(
        getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1,
      );
      if (moving.current) return;
      const last = grid.lastElementChild as HTMLElement | null;
      const to =
        folded && last
          ? last.offsetTop + last.offsetHeight / 2
          : grid.clientHeight + 24;
      const from = opening.current;
      if (from !== null && to > from) {
        opening.current = null;
        move(from, to, false, fit);
      } else frame.style.height = `${to}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(grid);
    return () => {
      observer.disconnect();
      moving.current?.();
    };
  }, [folded]);

  return {
    box,
    count,
    folded,
    canLess: shown !== null,
    showMore: () => {
      opening.current = box.current?.offsetHeight ?? null;
      setShown(count + PAGE);
      if (count + PAGE > total) more?.();
    },
    // Up to the first few rows: the frame closed, then the rest let go
    showLess: () => {
      const frame = box.current;
      const last = frame?.firstElementChild?.children[first - 1] as
        HTMLElement | undefined;
      if (!frame || !last) return setShown(null);
      move(
        frame.offsetHeight,
        last.offsetTop + last.offsetHeight / 2,
        true,
        () => setShown(null),
      );
    },
  };
}
