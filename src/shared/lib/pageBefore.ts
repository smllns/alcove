// The address the page now shown was come to from, noted as each page is
// shown (app/PageScroll): what a page can go by in deciding how to look
// once it's come back to
let current = '';
let before = '';

export function notePage(pathname: string) {
  if (pathname === current) return;
  before = current;
  current = pathname;
}

export const pageBefore = () => before;
