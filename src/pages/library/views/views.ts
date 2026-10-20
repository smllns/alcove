import { useState } from 'react';
import { easeChange } from '@/shared/lib/easeChange';
import { reducedMotionNow } from '@/shared/lib/motion';
import { readStored, store } from '@/shared/lib/storage';

// The ways to look at the shelves. The universe is the default: every book
// a star, scattered across a sky you can drag and zoom.
export type BookView =
  'universe' | 'grid-s' | 'grid-m' | 'grid-l' | 'list' | 'list-columns';

export type ViewKind = 'universe' | 'grid' | 'list';

export const kindOf = (view: BookView) => view.split('-')[0] as ViewKind;

const views: BookView[] = [
  'universe',
  'grid-s',
  'grid-m',
  'grid-l',
  'list',
  'list-columns',
];

// What's on screen, and the last size or layout used for each kind, so
// going back to the grid brings back the covers it had
type Choices = { current: BookView } & Record<ViewKind, BookView>;

const defaults: Choices = {
  current: 'universe',
  universe: 'universe',
  grid: 'grid-m',
  list: 'list',
};

const KEY = 'alcove.books-view';

// Anything unknown in what's stored (or anything broken) is ignored
function read(): Choices {
  try {
    const saved = JSON.parse(readStored(KEY) ?? '{}') as Partial<
      Record<keyof Choices, string>
    >;
    const valid = Object.entries(saved).filter(
      ([key, view]) =>
        key in defaults &&
        views.includes(view as BookView) &&
        (key === 'current' || kindOf(view as BookView) === key),
    );
    return { ...defaults, ...Object.fromEntries(valid) };
  } catch {
    return defaults;
  }
}

// The chosen view, and what each kind looked like last, remembered in this
// browser
export function useBookView() {
  const [choices, setChoices] = useState(read);

  // How the books on screen came in: with the page ('load'), by a
  // transition from another size or layout ('eased'), or switched to or
  // from the sky ('switched'), to come in whole, as one
  const [arrived, setArrived] = useState<'load' | 'eased' | 'switched'>('load');
  // The view on its way out after such a switch, for as long as it takes
  const [leaving, setLeaving] = useState<BookView | null>(null);

  const choose = (view: BookView) => {
    if (view === choices.current) return;
    const next = { ...choices, current: view, [kindOf(view)]: view };
    store(KEY, JSON.stringify(next));
    // Another size of grid or layout of list: each card glides to where it
    // now goes. Between the grid and the list: each cover in sight flies
    // across. To or from the sky, too far apart for that: the old view
    // goes on its way out as the new one comes in, the sky moving all the
    // while.
    const from = kindOf(choices.current);
    const to = kindOf(view);
    if (from !== to && (from === 'universe' || to === 'universe')) {
      setChoices(next);
      setArrived('switched');
      setLeaving(reducedMotionNow() ? null : choices.current);
      return;
    }
    easeChange(
      () => {
        setChoices(next);
        setArrived('eased');
      },
      from === to ? 'shelf' : 'view',
    );
  };

  return {
    view: choices.current,
    arrived,
    leaving,
    // The view that was leaving is gone
    left: () => setLeaving(null),
    choose,
    // Switching kind: back to how that kind was last left
    chooseKind: (kind: ViewKind) => choose(choices[kind]),
  };
}
