import { fromOpenLibrary } from './openLibrary.js';

// A writer the catalogue knows, as a search finds them
export type AuthorResult = {
  key: string;
  name: string;
  born?: string;
  died?: string;
  // Their best-known book, and how many they wrote
  topWork?: string;
  workCount: number;
};

type AuthorDoc = {
  key: string;
  name: string;
  birth_date?: string;
  death_date?: string;
  top_work?: string;
  work_count?: number;
};

// Writers by name, those with the most books first
export async function searchAuthors(query: string): Promise<AuthorResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '6',
    fields: 'key,name,birth_date,death_date,top_work,work_count',
  });
  const { docs } = await fromOpenLibrary<{ docs: AuthorDoc[] }>(
    `/search/authors.json?${params}`,
  );
  return docs
    .map((doc) => ({
      key: doc.key.replace('/authors/', ''),
      name: doc.name,
      born: doc.birth_date,
      died: doc.death_date,
      topWork: doc.top_work,
      workCount: doc.work_count ?? 0,
    }))
    .sort((a, b) => b.workCount - a.workCount);
}
