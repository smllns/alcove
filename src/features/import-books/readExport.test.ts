import { describe, expect, it } from 'vitest';
import { countBrought, toBring, toWant } from './imported';
import { readExport } from './readExport';

const goodreads = [
  'Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies',
  '1,"Leviathan Wakes (The Expanse, #1)",James S.A. Corey,"Corey, James S.A.",,"=""0316129089""","=""9780316129084""",4,4.2,Orbit,Paperback,561,2011,2011,2021/03/14,2020/01/02,,,read,"Great.<br/>Really &amp; truly.",,Lent to Anna,1,1',
  '2,Emma,Jane Austen,"Austen, Jane",,"=""""","=""""",0,4,,Kindle Edition,,2003,1815,,2022/05/01,to-read,to-read (#1),to-read,,,,0,0',
  '3,Circe,Madeline Miller,"Miller, Madeline",,,,5,4.3,,Hardcover,393,2018,2018,2023/07/01,2021/06/01,,,read,,,,1,0',
].join('\n');

const storygraph = [
  'Title,Authors,Contributors,ISBN/UID,Format,Read Status,Date Added,Last Date Read,Dates Read,Read Count,Moods,Pace,Character- or Plot-Driven?,Strong Character Development?,Loveable Characters?,Diverse Characters?,Flawed Characters?,Star Rating,Review,Content Warnings,Content Warning Description,Tags,Owned?',
  'Piranesi,Susanna Clarke,,9781635575637,hardcover,read,2022/01/10,2022/02/01,2022/01/12-2022/02/01,1,,,,,,,,4.25,Odd and lovely.,,,,Yes',
  'Dune,Frank Herbert,,d7d5a1c2-uid,audio,did-not-finish,2022/03/01,,,0,,,,,,,,,,,,,No',
].join('\n');

describe('readExport', () => {
  it('reads Goodreads: series, ISBN, shelf, day read, stars, review', () => {
    const found = readExport(goodreads)!;
    expect(found.source).toBe('Goodreads');
    const [expanse, circe, emma] = found.books;
    expect(expanse.book).toMatchObject({
      title: 'Leviathan Wakes',
      series: { name: 'The Expanse', number: 1 },
      authors: ['James S.A. Corey'],
      isbn: '9780316129084',
      pages: 561,
      format: 'paperback',
      copy: {
        reading: 'read',
        finished: '2021-03-14',
        rating: 4,
        review: 'Great.\nReally & truly.',
        notes: ['Lent to Anna'],
      },
    });
    expect(emma.wanted).toBe(true);
    expect(emma.book.copy).toMatchObject({ nonPhysical: 'ebook' });
    expect(circe.wanted).toBe(false);
  });

  it('reads StoryGraph: days of the last reading, quarter stars, owned', () => {
    const found = readExport(storygraph)!;
    expect(found.source).toBe('StoryGraph');
    const [piranesi, dune] = found.books;
    expect(piranesi.book).toMatchObject({
      isbn: '9781635575637',
      format: 'hardcover',
      copy: {
        started: '2022-01-12',
        finished: '2022-02-01',
        rating: 4.5,
        review: 'Odd and lovely.',
      },
    });
    expect(dune.book.isbn).toBeUndefined();
    expect(dune.book.copy).toMatchObject({
      reading: 'unread',
      nonPhysical: 'audiobook',
    });
  });

  it('shelves paper editions, keeps e-books apart, wanted ones for the list', () => {
    const { books } = readExport(goodreads)!;
    expect(countBrought(books)).toEqual({ shelved: 2, screen: 0, wanted: 1 });
    expect(toBring(books).map((book) => book.title)).toEqual([
      'Leviathan Wakes',
      'Circe',
    ]);
    expect(toWant(books)).toEqual([
      { title: 'Emma', authors: ['Jane Austen'], isbn: undefined },
    ]);
  });

  it('turns away a file from anywhere else', () => {
    expect(readExport('Name,Year\nEmma,1815')).toBeNull();
  });
});
