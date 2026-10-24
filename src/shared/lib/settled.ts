// Whether a query has had its answer (or failed), or was never going to be
// asked (nothing to ask about): for showing what depends on several at
// once, when all are in, rather than piece by piece
export const settled = (query: { isPending: boolean; fetchStatus: string }) =>
  !query.isPending || query.fetchStatus === 'idle';
