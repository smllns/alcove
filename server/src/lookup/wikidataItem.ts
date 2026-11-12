import { english, entities, yearOf, type Entity } from './wikidata.js';

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

// The languages a writer's names are gathered in: the reader's likeliest,
// and the ones books mostly come from
const NAMED_IN = 'en|ru|uk|fr|de|es|it|pl|pt|nl|sv|ja|zh';

// Every name Wikidata gives someone's item in those languages, its labels
// and other names ("Annie Ernaux", "Анни Эрно"), for them to be one writer
// however a reader writes them
export async function itemNames(item: string) {
  const entity = (
    await entities([item], 'labels|aliases', { languages: NAMED_IN })
  )[item];
  const values = (all: Entity['labels']) =>
    Object.values(all ?? {}).flatMap((each) =>
      (Array.isArray(each) ? each : [each]).map((one) => one.value),
    );
  return [...new Set([...values(entity?.labels), ...values(entity?.aliases)])];
}
