// The parts of the library, in the order of the tabs. Each has its own
// address, so a section can be bookmarked or opened in a new tab.
export const sections = [
  { key: 'all', label: 'All books', path: '/library' },
  { key: 'places', label: 'Places', path: '/library/places' },
  { key: 'loans', label: 'On loan', path: '/library/loans' },
  { key: 'quotes', label: 'Quotes', path: '/library/quotes' },
  { key: 'stats', label: 'Stats', path: '/library/stats' },
] as const;

export type SectionKey = (typeof sections)[number]['key'];
