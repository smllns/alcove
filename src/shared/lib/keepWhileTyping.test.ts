import type { Query } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { keepWhileTyping } from './keepWhileTyping';

// The search before, as TanStack Query hands it over: its key, text last
const last = (text: string) =>
  ({ queryKey: ['catalogue', 'search', text] }) as unknown as Query<
    string[],
    Error,
    string[],
    readonly unknown[]
  >;
const found = ['found before'];

describe('keeping what the last search found, while typing', () => {
  it('keeps it as letters are added or taken off the end', () => {
    expect(keepWhileTyping('tolkien')(found, last('tolk'))).toBe(found);
    expect(keepWhileTyping('tolk')(found, last('tolkien'))).toBe(found);
  });

  it('starts afresh for something else typed in', () => {
    expect(keepWhileTyping('piranesi')(found, last('tolkien'))).toBeUndefined();
  });

  it('starts afresh with nothing searched before', () => {
    expect(keepWhileTyping('tolkien')(undefined, undefined)).toBeUndefined();
    expect(keepWhileTyping('tolkien')(found, last(''))).toBeUndefined();
  });
});
