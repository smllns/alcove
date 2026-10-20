import { useState } from 'react';
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

  const choose = (view: BookView) => {
    const next = { ...choices, current: view, [kindOf(view)]: view };
    setChoices(next);
    store(KEY, JSON.stringify(next));
  };

  return {
    view: choices.current,
    choose,
    // Switching kind: back to how that kind was last left
    chooseKind: (kind: ViewKind) => choose(choices[kind]),
  };
}
