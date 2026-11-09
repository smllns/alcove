import { english, entities, yearOf } from './wikidata.js';

// What Wikidata has on someone's item: the years they were born and died
// ("born" P569, "died" P570), and their name in English, the way the book
// catalogue would have it; each left out when it's not known
export async function itemFacts(item: string) {
  const entity = (await entities([item], 'claims|labels', { languages: 'en' }))[
    item
  ];
  return {
    born: entity && yearOf(entity, 'P569'),
    died: entity && yearOf(entity, 'P570'),
    english: entity && english(entity),
  };
}
