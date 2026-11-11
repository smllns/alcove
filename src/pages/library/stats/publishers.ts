import { searchable } from '@/entities/book/matches';
import type { Book } from '@/entities/book/types';
import { inLatin, misspelt } from '@/shared/lib/spelling';
import {
  gather,
  joined,
  nameOf,
  type Gathered,
} from '@/entities/book/sameNames';
import { byMost, type Tally } from '@/entities/book/tallies';

// Who published the reader's books, each publisher once however its name
// is written

// Words that say a name is a firm's, not which firm: "HarperCollins
// Publishers Ltd" is HarperCollins
const FIRM = new Set(
  (
    'the and publisher publishers publishing publications ltd limited inc ' +
    'incorporated llc plc co company corp corporation group gmbh books uk ' +
    'us usa паблишер паблишерс паблишинг издательство издательский дом ' +
    'изд во ооо зао оао ао пао'
  ).split(' '),
);

// Names that are one publisher but can't be told so from how they're
// written: Russian АСТ in Latin capitals that only look the same, and an
// imprint named otherwise than its publisher (Иностранка, Азбука's)
const SAME: Record<string, string> = { act: 'ast', inostranka: 'azbuka' };

// A publisher as told apart from others: its name in Latin letters,
// without case, accents, punctuation, spaces or words like Publishers and
// Ltd, so "Harper Collins Publishers Ltd" and "HarperCollins" are one, and
// "Индивидуум" and "Individuum". A name of those words only is kept whole.
export function publisherKey(name: string) {
  return told(ownWords(name).join(''));
}

// Words of a name as compared
const told = (words: string) => {
  const key = inLatin(searchable(words));
  return SAME[key] ?? key;
};

// The words of a name that say which firm it is, as written ("Harper
// Collins Publishers Ltd": Harper, Collins); all of them, for a name of
// firm's words only
function ownWords(name: string) {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const own = words.filter((word) => !FIRM.has(searchable(word)));
  return own.length ? own : words;
}

const wordsOf = (name: string) => ownWords(name).map(told);
const sameWord = (a: string, b: string) => a === b || misspelt(a, b);

// The house a publisher writing its name as one word in two capitals is
// named by: its first part ("HarperCollins", "HarperVia": Harper)
function houseOf(name: string) {
  const joined = /^(\p{Lu}\p{Ll}+)\p{Lu}/u.exec(ownWords(name)[0] ?? '');
  return joined ? told(joined[1]) : undefined;
}

// The publishers with their imprints: one whose name is another's with
// more words after it ("Альпина. Проза", "Penguin Classics") counted with
// that one ("Альпина", "Penguin Books"), and one beginning with the house
// a publisher's joined name is named by ("Harper Perennial", "HarperVia")
// with that one ("HarperCollins"), when the reader has that one too
function withImprints(found: Gathered[]) {
  const told = found
    .map((each) => ({
      each,
      words: wordsOf(each.first),
      house: houseOf(each.first),
    }))
    .sort((a, b) => a.words.length - b.words.length);
  const kept: typeof told = [];
  for (const one of told) {
    const publisher = kept.find(
      ({ words, house }) =>
        (words.length < one.words.length &&
          words.every((word, i) => sameWord(word, one.words[i]))) ||
        (house !== undefined && house === (one.house ?? one.words[0])),
    );
    if (publisher) joined(publisher.each, one.each);
    else kept.push(one);
  }
  return kept.map(({ each }) => each);
}

// The publishers, the most books first, those written differently counted
// as one (publisherKey, or a letter apart), with their imprints
// (withImprints), each by one name (nameOf)
export function publishers(books: Book[]) {
  const own = (name: string) => ownWords(name).join('');
  return byMost(
    withImprints(gather(books, (book) => [book.publisher], publisherKey)).map(
      (each): Tally => ({ name: nameOf(each, own), books: each.books }),
    ),
  );
}
