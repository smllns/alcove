// How many chapters come before each of the almanac's parts, for its
// chapters to be numbered on from the part before
export const startsOf = (sections: { parts: unknown[] }[]) =>
  sections.map((_, s) =>
    sections.slice(0, s).reduce((sum, { parts }) => sum + parts.length, 0),
  );
