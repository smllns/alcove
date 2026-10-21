import { config } from '../config.js';

// How we introduce ourselves to the open catalogues (Open Library,
// Wikiquote): both ask for a User-Agent naming the app and, if there is
// one, a way to get in touch, and treat those who give it more kindly
export const contact = config.OPENLIBRARY_CONTACT;

export const HEADERS = {
  'User-Agent': contact
    ? `alcove/1.0 (${contact})`
    : 'alcove/1.0 (personal library app)',
};
