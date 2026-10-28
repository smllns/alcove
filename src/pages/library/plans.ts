import type { SectionKey } from '@/widgets/library-header';

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
  lists: {
    title: 'Books, gathered your way',
    text: 'Every list you’ve made, with the books in it: to read this summer, the best of the year, the ones to lend. Add a book to one as you add it, or from its page.',
    cards: [
      { title: 'To read this summer', detail: '12 books' },
      { title: 'Best of the year', detail: '8 books · 3 still to read' },
      {
        title: 'From Open Library',
        detail: 'Lists other readers made that your books are in',
      },
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
  profile: {
    title: 'Your corner of alcove',
    text: 'What others see when they find you: your shelves, the lists you share, what you’re reading now. The people you follow, and the ones who follow you.',
    cards: [
      {
        title: 'Followers',
        detail: 'The readers who keep up with your shelves',
      },
      { title: 'Following', detail: 'Whose new books show up in your feed' },
      {
        title: 'As others see it',
        detail: 'Your library from the outside, and what stays private',
      },
    ],
  },
};
