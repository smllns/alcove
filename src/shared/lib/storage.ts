// The browser's own storage, for small preferences. It can be switched off
// (a private window, blocked site data); then nothing is remembered, and
// everything works as before.

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not remembered, that's all
  }
}

// Whose preferences are being kept: the reader signed in (set as they
// sign in or out), so one reader's choices don't carry over to another
// in the same browser
let owner = '';
export const keepFor = (userId: string) => {
  owner = userId;
};

// The same, kept for the reader signed in alone
const ownKey = (key: string) => (owner ? `${key}:${owner}` : key);
export const readOwn = (key: string) => readStored(ownKey(key));
export const storeOwn = (key: string, value: string) =>
  store(ownKey(key), value);

// What's kept under `key` as JSON, or `fallback` with nothing (or nothing
// readable) kept
export function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const text = readStored(key);
    return text ? ((JSON.parse(text) as T | null) ?? fallback) : fallback;
  } catch {
    return fallback;
  }
}
