// How a page change animates.
//   forward:     deeper into the app; the new page rises over the old one
//                (a View Transition, styled in styles/transitions.css)
//   back:        toward home; a curtain drops and lifts
//   theme:       the light/dark circle reveal
export type PageTransition = 'forward' | 'back' | 'theme';

// back is done with a curtain over the page rather than a View Transition
export const usesCurtain = (kind: PageTransition) => kind === 'back';

// View Transitions read the kind off <html data-transition> to pick an animation
export function setPageTransition(kind: PageTransition) {
  document.documentElement.dataset.transition = kind;
}
