// Where the reader keeps books, named however they like: homes, the rooms in
// them, the bookcases (or chests, or boxes) in those, and their shelves.
// Mirrors the tree on the server.
export type Shelf = { id: string; name: string };
export type Unit = { id: string; name: string; shelves: Shelf[] };
export type Room = { id: string; name: string; units: Unit[] };
export type Home = { id: string; name: string; rooms: Room[] };

// Where one book is; only the home is required
export type PlaceRef = {
  home: string;
  room?: string;
  unit?: string;
  shelf?: string;
};

// The tree, and how many books are in each place by id
export type Places = { homes: Home[]; counts: Record<string, number> };
