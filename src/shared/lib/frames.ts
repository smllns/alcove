// Resolves once the browser has painted the current state, e.g. a page we just
// navigated to (navigate() itself returns before that)
export const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
