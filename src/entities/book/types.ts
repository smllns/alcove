export type Binding = 'hardcover' | 'paperback';

// A copy of a book on someone's shelf
export type Book = {
  title: string;
  author: string;
  cover: string;
  isbn: string;
  genre: string;
  blurb: string;
  price: string;
  binding: Binding;
  // Cover colours, used for the spine, the back and the fallback cover
  color: string;
  ink: string;
  type: 'sans' | 'serif';
  // 0 is fresh from the shop, 1 is read to pieces
  wear: number;
};

type Vec3 = [number, number, number];

// Where a book hangs in a 3D scene
export type SceneSlot = {
  position: Vec3;
  // On phones, as a fraction of the half-viewport. Books without one are
  // left out of the narrow layout to keep the text clear.
  mobile?: Vec3;
  rotation: Vec3;
  width: number;
  thickness: number;
  // Entrance order, in seconds
  delay: number;
};

export type ShowcaseBook = Book & SceneSlot;
