// Where each of the app's pages is, in one place, so a page's address is
// never spelled out twice
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  library: '/library',
  places: '/library/places',
  profile: '/library/profile',
  addBook: '/library/add',
  settings: '/settings',
  welcome: '/welcome',
  book: (id: string) => `/library/books/${id}`,
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
