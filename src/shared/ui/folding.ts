import { createContext, useContext } from 'react';

// Whether the text around is long text that folds (Fold), which a click
// opens or folds back: text in it that's otherwise changed by a click
// leaves that to its own button
export const Folding = createContext(false);
export const useFolding = () => useContext(Folding);
