import type { News } from '@/entities/news/types';
import type { SavedList } from '@/entities/list/types';
import type { PagePart, Privacy } from '@/entities/user/types';

// Another reader's page (or the reader's own) as the server lets it be
// seen. Mirrors readerPage in server/src/users/profile.ts.

// How the one looking stands to them: following, asking to, or neither
export type FollowState = 'following' | 'asked' | 'none';

// A book of theirs, with only the parts of it the one looking may see
export type ReaderBook = {
  id: string;
  // Its work in the catalogue; one the catalogue doesn't know, book-…
  workKey: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  firstPublishedYear?: number;
  pages?: number;
  // When it came to their shelves
  addedAt: string;
  rating?: number;
  reading?: 'reading' | 'read';
  started?: string;
  finished?: string;
  quotes?: string[];
};

export type ReaderPage = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  about: string | null;
  you: boolean;
  follow: FollowState;
  followsYou: boolean;
  // How many books they have (null where that's not seen), how many follow
  // them and they follow
  counts: {
    books: number | null;
    followers: number;
    following: number;
  };
  // Whether anything beyond who they are is seen (a page to be asked for
  // isn't, till they let the one looking in)
  open: boolean;
  shows: Record<PagePart, boolean>;
  // Only on the reader's own page: who sees each part, and how many ask
  // to follow them
  privacy?: Privacy;
  asking?: number;
  books: ReaderBook[];
  // The four they'd most have seen, first to last
  favourites: ReaderBook[];
  // Their public lists, as a list kept from another reader is
  lists: SavedList[];
};

// A reader as they're listed among those following and followed
export type ListedReader = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
};

// What another reader wrote of a book, for its page: who, their stars (if
// they let anyone see them) and when. Mirrors readersReviews in
// server/src/users/reviews.ts.
export type ReaderReview = {
  // The copy it's kept on, by which it's liked
  id: string;
  reader: ListedReader;
  // Its hearts, and whether the one looking gave one
  likes: number;
  liked: boolean;
  review: string;
  rating?: number;
  at: string;
};

// What a reader did with a book (or for the one looking alone), as their
// feed tells it
export type ActivityKind =
  | 'added'
  | 'started'
  | 'finished'
  | 'reviewed'
  | 'liked'
  | 'followed'
  | 'asked';

// One thing in the reader's feed: alcove's own news, or what one they follow
// did with a book, or what was done for them alone (`forYou`). Mirrors
// feedOf in server/src/users/feed.ts.
export type FeedItem =
  | { id: string; kind: 'news'; at: string; news: News }
  | {
      id: string;
      kind: ActivityKind;
      at: string;
      forYou: boolean;
      // Who did it
      reader: ListedReader;
      book?: {
        // Their copy (or, a heart, the reader's own copy reviewed)
        id: string;
        workKey: string;
        title: string;
        authors: string[];
        coverUrl?: string;
        rating?: number;
        review?: string;
      };
    };

// The reader's feed, and how much of it is new since they last looked
export type Feed = { items: FeedItem[]; unread: number };
