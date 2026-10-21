// Open Library tags a work with subjects in any number, in any language,
// from "Fiction" to "Telephone directories". These rules pick out the
// usual shelves of a bookshop among them, the same ones the form offers
// (src/widgets/book-form/GenrePicker.tsx), so they come already chosen.
// The list runs roughly from the most telling subject to the least, with
// odd ones far down ("comic books, strips" for Nineteen Eighty-Four), so a
// genre has to be named early on, or more than once.

// How far down the list one mention is enough
const EARLY = 12;

const rules: [genre: string, pattern: RegExp][] = [
  ['Classics', /\bclassics?\b|classic literature/],
  ['Fantasy', /fantasy/],
  ['Science fiction', /science fiction|sci-fi|dystopia/],
  ['Mystery', /myster|detective|crime fiction|whodunit/],
  ['Thriller', /thriller|suspense/],
  ['Romance', /\bromance\b|love stories/],
  ['Poetry', /poetry|\bpoems\b/],
  // Not "history and criticism", which is about the writing
  ['History', /(^|[\s,-])history($|[\s,-])(?!and criticism)/],
  ['Biography', /biograph|memoir/],
  ['Philosophy', /philosoph/],
  [
    'Science',
    /^science$|popular science|physics|biology|chemistry|astronomy|mathematics/,
  ],
  ['Self-help', /self-help|self-actualization|personal growth|\bhabits?\b/],
  ['Children’s', /juvenile (fiction|literature)|children's/],
  ['Graphic novel', /graphic novel|comic/],
];

// What only a story is shelved as
const FICTION = /fiction|novels?\b/;
// Kinds that are about the real world, for a book with no story in it
const FACTUAL = ['History', 'Biography', 'Philosophy', 'Science', 'Self-help'];

export function genresOf(subjects: string[] | undefined) {
  const tags = (subjects ?? []).map((s) => s.toLowerCase());
  const genres = rules
    .filter(([genre, pattern]) => {
      const places = tags.flatMap((tag, i) =>
        pattern.test(tag) &&
        // "Science fiction" isn't science
        !(genre === 'Science' && tag.includes('fiction'))
          ? [i]
          : [],
      );
      return places.length > 1 || places[0] < EARLY;
    })
    .map(([genre]) => genre);
  const fiction = tags.some((tag) => FICTION.test(tag));
  if (fiction) return ['Fiction', ...genres];
  if (genres.some((genre) => FACTUAL.includes(genre)))
    return ['Non-fiction', ...genres];
  return genres;
}
