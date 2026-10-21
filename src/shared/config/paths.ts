// Where each of the app's pages is, in one place, so a page's address is
// never spelled out twice
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  library: '/library',
  addBook: '/library/add',
  settings: '/settings',
  welcome: '/welcome',
  book: (id: string) => `/library/books/${id}`,
  editBook: (id: string) => `/library/books/${id}/edit`,
};
