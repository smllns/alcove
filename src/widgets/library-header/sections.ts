import { paths } from '@/shared/config/paths';
// The parts of the library, in the order of the tabs. Each has its own
// address, so a section can be bookmarked or opened in a new tab.
export const sections = [
  { key: 'all', label: 'My books', path: paths.library },
  { key: 'places', label: 'Places', path: paths.places },
  { key: 'loans', label: 'On loan', path: `${paths.library}/loans` },
  { key: 'lists', label: 'Lists', path: `${paths.library}/lists` },
  { key: 'stats', label: 'Stats', path: `${paths.library}/stats` },
] as const;

export type SectionKey = (typeof sections)[number]['key'];
