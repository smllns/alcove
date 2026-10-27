// The letters a room's bookcases are tagged with, one after another, in
// its drawing and their details alike
export const tagOf = (i: number) => String.fromCharCode(65 + (i % 26));
// Where a bookcase's detail is on the page, for its tag to lead to it
export const detailOf = (id: string) => `bookcase-${id}`;
