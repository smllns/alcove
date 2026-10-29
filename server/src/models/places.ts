import type { ObjectId } from 'mongodb';

// Where a reader keeps books, named however they like: homes, the rooms in
// them, the bookcases (or chests, or boxes) in those, and their shelves.
// Only the home is required of a book's place; the rest narrows it down.
export type ShelfNode = { id: string; name: string };
export type UnitNode = { id: string; name: string; shelves: ShelfNode[] };
export type RoomNode = { id: string; name: string; units: UnitNode[] };
export type HomeNode = { id: string; name: string; rooms: RoomNode[] };

// One per reader, keyed by their id
export type PlacesDoc = {
  _id: ObjectId;
  homes: HomeNode[];
  updatedAt: Date;
};

// A spot in that tree
export type PlaceRef = {
  home: string;
  room?: string;
  unit?: string;
  shelf?: string;
};
