import type { Home } from '@/entities/place/types';

// The editor's working copy of the tree. Every level has the same shape
// here, which keeps the editing code to one set of functions; a place being
// removed is `leaving` while it folds away.
export type EditNode = {
  id: string;
  name: string;
  leaving?: boolean;
  children?: EditNode[];
};

export const levels = [
  { label: 'Home', add: 'a home', placeholder: 'Flat in Berlin' },
  { label: 'Room', add: 'a room', placeholder: 'Living room' },
  { label: 'Bookcase', add: 'a bookcase', placeholder: 'Tall bookcase' },
  { label: 'Shelf', add: 'a shelf', placeholder: '1' },
] as const;

// What each level's children are called on the server
const childKeys = ['rooms', 'units', 'shelves'] as const;
const listKeys = ['homes', ...childKeys] as const;

let lastId = 0;
// A temporary id; the server swaps it for a real one on saving
export const newId = () => `new-${++lastId}`;

export const blank = (): EditNode => ({ id: newId(), name: '', children: [] });

type Tree = { id: string; name: string } & Partial<
  Record<(typeof childKeys)[number], Tree[]>
>;

export function fromHomes(homes: Home[]) {
  const convert = (nodes: Tree[], depth: number): EditNode[] =>
    nodes.map((node) => {
      const key = childKeys[depth];
      return {
        id: node.id,
        name: node.name,
        children: key ? convert(node[key] ?? [], depth + 1) : [],
      };
    });
  return convert(homes, 0);
}

export function toHomes(nodes: EditNode[]): Home[] {
  const convert = (list: EditNode[], depth: number): Tree[] =>
    list.map((node) => {
      const key = childKeys[depth];
      return {
        id: node.id,
        name: node.name.trim(),
        ...(key && { [key]: convert(node.children ?? [], depth + 1) }),
      };
    });
  return convert(nodes, 0) as Home[];
}

// Changes the node at `path` (its index at each level, home first)
export function updateAt(
  nodes: EditNode[],
  path: number[],
  change: (node: EditNode) => EditNode,
): EditNode[] {
  const [index, ...rest] = path;
  return nodes.map((node, i) =>
    i !== index
      ? node
      : rest.length
        ? { ...node, children: updateAt(node.children ?? [], rest, change) }
        : change(node),
  );
}

// Puts `child` last among the children of the node at `path`, or among the
// homes when the path is empty
export const addChild = (
  nodes: EditNode[],
  path: number[],
  child: EditNode,
): EditNode[] =>
  path.length
    ? updateAt(nodes, path, (node) => ({
        ...node,
        children: [...(node.children ?? []), child],
      }))
    : [...nodes, child];

// The path to a chain of ids, home first: [homeId, roomId] → [2, 0]
export function pathTo(nodes: EditNode[], ids: string[]): number[] {
  const path: number[] = [];
  let level = nodes;
  for (const id of ids) {
    const index = level.findIndex((node) => node.id === id);
    if (index < 0) break;
    path.push(index);
    level = level[index].children ?? [];
  }
  return path;
}

export const removeId = (nodes: EditNode[], id: string): EditNode[] =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: removeId(node.children ?? [], id) }));

// The tree as it'll be saved: nothing on its way out, and no unnamed places
// with nothing in them (a blank row the reader added and left)
export const tidy = (nodes: EditNode[]): EditNode[] =>
  nodes.flatMap((node) => {
    if (node.leaving) return [];
    const children = tidy(node.children ?? []);
    return node.name.trim() || children.length ? [{ ...node, children }] : [];
  });

export const idsOf = (nodes: EditNode[]): string[] =>
  nodes.flatMap((node) => [node.id, ...idsOf(node.children ?? [])]);

// How many books sit in saved places that the draft no longer has. Only
// the topmost removed place counts, since its books are also counted in
// every place inside it.
export function booksInRemoved(
  saved: EditNode[],
  kept: Set<string>,
  counts: Record<string, number>,
): number {
  return saved.reduce(
    (sum, node) =>
      sum +
      (kept.has(node.id)
        ? booksInRemoved(node.children ?? [], kept, counts)
        : (counts[node.id] ?? 0)),
    0,
  );
}

// Where the server reports a problem with the place at `path`
export const errorKey = (path: number[]) =>
  `${path.map((index, depth) => `${listKeys[depth]}.${index}`).join('.')}.name`;
