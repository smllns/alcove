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
  // How many books they have and have read (null where that's not seen),
  // how many follow them and they follow
  counts: {
    books: number | null;
    read: number | null;
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
  // Their public lists, as a list kept from another reader is
  lists: SavedList[];
};

// A reader as they're listed among those following and followed
export type ListedReader = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
};
