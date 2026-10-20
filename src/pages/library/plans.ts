import type { SectionKey } from './sections';

// What each section still to be built will hold, shown in its place
type Plan = {
  title: string;
  text: string;
  // A glimpse of what the section will hold
  cards: { title: string; detail: string }[];
};

export const plans: Record<Exclude<SectionKey, 'all'>, Plan> = {
  places: {
    title: 'Your books, room by room',
    text: 'Every home, room, bookcase and shelf, with the books that sit on each. Pick a home to see only what’s there.',
    cards: [
      {
        title: 'Flat in Berlin',
        detail: 'Living room · 3 bookcases · 86 books',
      },
      { title: 'Tall bookcase', detail: 'Shelf 2 · 14 books' },
      { title: 'Not placed yet', detail: 'Books still waiting for a shelf' },
    ],
  },
  loans: {
    title: 'Who has what',
    text: 'Books you’ve lent out and books you’ve borrowed, who has them and since when. The ones that are overdue come first.',
    cards: [
      { title: 'Lent to Anna', detail: 'The Secret History · since March' },
      { title: 'Borrowed from Max', detail: 'Piranesi · back by June' },
      {
        title: 'Overdue',
        detail: 'A gentle nudge when one’s been away too long',
      },
    ],
  },
  quotes: {
    title: 'Everything you underlined',
    text: 'The quotes and notes from every book, gathered in one place, to read through or search.',
    cards: [
      {
        title: '“What is essential is invisible to the eye.”',
        detail: 'The Little Prince',
      },
      { title: 'Search them all', detail: 'Find that line you half remember' },
      { title: 'A quote a day', detail: 'One of yours, picked at random' },
    ],
  },
  stats: {
    title: 'Your library in numbers',
    text: 'What your shelves say about you, from the authors you keep coming back to, to how many pages you own.',
    cards: [
      {
        title: 'Books and pages',
        detail: 'How many, and how tall a stack they’d make',
      },
      { title: 'Favourite authors', detail: 'The names that show up most' },
      { title: 'Genres', detail: 'What your shelves lean towards' },
      {
        title: 'By decade',
        detail: 'From the oldest book you own to the newest',
      },
      { title: 'Added each month', detail: 'When the library grew' },
      { title: 'Languages', detail: 'Every language you read in' },
      {
        title: 'Longest and shortest',
        detail: 'The doorstop and the slimmest one',
      },
      { title: 'Most quoted', detail: 'The books you underlined the most' },
    ],
  },
};
