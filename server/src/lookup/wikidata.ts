import { fromWikimedia } from './wikimedia.js';

// Asking Wikidata, where a person or a book is one item with its names in
// every language, what's said of it (claims, as "born" P569 or "written
// by" P50), and its articles in each Wikipedia

const API = 'https://www.wikidata.org/w/api.php';

type Values = Record<string, { value: string } | { value: string }[]>;
type Claim = {
  mainsnak?: { datavalue?: { value?: { id?: string; time?: string } } };
};
export type Entity = {
  labels?: Values;
  aliases?: Values;
  claims?: Record<string, Claim[]>;
  sitelinks?: Record<string, { title: string } | undefined>;
};

export const wikidata = <T>(params: Record<string, string>) =>
  fromWikimedia<T>(
    `${API}?${new URLSearchParams({ format: 'json', ...params })}`,
  );

// Items by their ids, with what `props` asks for ("labels|claims"), and
// any more of the request (`more`: the languages, the wikis to link to)
export const entities = async (
  ids: string[],
  props: string,
  more: Record<string, string> = {},
) =>
  (
    await wikidata<{ entities?: Record<string, Entity> }>({
      action: 'wbgetentities',
      ids: ids.join('|'),
      props,
      ...more,
    })
  ).entities ?? {};

const value = (entity: Entity, property: string) =>
  entity.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;

// The item a claim points to ("written by" P50: the writer's)
export const linked = (entity: Entity, property: string) =>
  value(entity, property)?.id;

// The year a claim's date falls in, written "+1922-11-11T00:00:00Z"
export const yearOf = (entity: Entity, property: string) => {
  const match = /^([+-]\d+)-/.exec(value(entity, property)?.time ?? '');
  return match ? Number(match[1]) : undefined;
};

// The English label, as a name or a title
export const english = (entity: Entity) => {
  const label = entity.labels?.en;
  return Array.isArray(label) ? label[0]?.value : label?.value;
};
