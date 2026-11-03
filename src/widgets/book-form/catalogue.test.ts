import { describe, expect, it } from 'vitest';
import type { CatalogueEdition } from '@/entities/book/types';
import { keepsEdition, withEdition } from './catalogue';
import { emptyFields } from './draft';

const edition: CatalogueEdition = {
  editionKey: 'OL1M',
  title: 'Dune',
  isbn: '9780441172719',
  publisher: 'Ace',
  publishedYear: 1990,
  pages: 535,
  language: 'eng',
};

describe('keepsEdition', () => {
  it('holds while the details are the edition’s', () => {
    const fields = withEdition(emptyFields, edition);
    expect(keepsEdition(fields, edition)).toBe(true);
    // The language isn't the printing's to keep
    expect(keepsEdition({ ...fields, language: 'fre' }, edition)).toBe(true);
  });

  it('lets go once one of its details is changed', () => {
    const fields = withEdition(emptyFields, edition);
    expect(keepsEdition({ ...fields, publisher: 'Gollancz' }, edition)).toBe(
      false,
    );
  });
});
