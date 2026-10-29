// Where each of the app's pages is, in one place, so a page's address is
// never spelled out twice
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  library: '/library',
  places: '/library/places',
  profile: '/library/profile',
  stats: '/library/stats',
  lists: '/library/lists',
  list: (id: string) => `/library/lists/${id}`,
  // A list being begun, kept once something's done in it (ListPage)
  newList: '/library/lists/new',
  // Another reader's public list, and one a reader made on Open Library
  sharedList: (id: string) => `/library/lists/shared/${id}`,
  readersList: (owner: string, id: string) =>
    `/library/lists/readers/${owner}/${id}`,
  // One of the lists every reader sees (Open Library's)
  featuredList: (id: string) => `/library/lists/featured/${id}`,
  addBook: '/library/add',
  settings: '/settings',
  welcome: '/welcome',
  book: (id: string) => `/library/books/${id}`,
  // A book from the catalogue, not on the reader's shelves (yet)
  work: (workKey: string) => `/library/works/${workKey}`,
  // `step`: open on the reader's own copy, rather than the book itself
  editBook: (id: string, step?: 'copy') =>
    `/library/books/${id}/edit${step ? `?step=${step}` : ''}`,
  // A home in the places, or one of its rooms, and in it, `book` found
  placeOf: (at: { home: string; room?: string }, book?: string) =>
    `/library/places?${new URLSearchParams({
      home: at.home,
      ...(at.room && { room: at.room }),
      ...(book && { book }),
    })}`,
};
