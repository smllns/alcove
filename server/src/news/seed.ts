import { ObjectId } from 'mongodb';
import { news } from '../db.js';

// The news alcove had before news could be written here, kept once
// (migrations.ts)
export async function seedNews() {
  const at = new Date('2026-10-24T12:00:00Z');
  await news().insertOne({
    _id: new ObjectId(),
    title: 'Places is here: your books, room by room',
    body: 'Draw your home, put every book on its shelf, and find any of them in a second.',
    link: { label: 'Open Places', to: '/library/places' },
    createdAt: at,
    updatedAt: at,
  });
}
