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
