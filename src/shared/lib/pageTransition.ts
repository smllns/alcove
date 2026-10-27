import { flyCoverHome } from './coverFlight';

// How a page change animates.
//   forward:     deeper into the app; the new page rises over the old one
//                (a View Transition, styled in styles/transitions.css)
//   back:        toward home; a curtain drops and lifts
//   return:      back the way the reader came (a book's page to the
//                shelves): the page lowers away like a sheet, uncovering
//                the one underneath, forward played backwards
//   none:        no animation of ours, e.g. when the browser animates a
//                swipe back itself
//   zoom:        a book's cover drawn up to fill the screen, and back
//   switch:      one part of a page changing what it shows (the two steps
//                of a book's form), softly, the rest staying put
//   theme:       the light/dark circle reveal
//   shelf:       books on the page rearranging (a search, say): each glides
//                to its new place, those leaving fade, newcomers fade in
//   view:        the books shown another way (grid, list): each cover in
//                sight flies to where it is in the new view
//   swap:        something shown in place of what was (another home or
//                room, the places shown another way): coming in over it
//                where it stands (styles/places.css)
//   onward:      another of the library's sections, chosen from the tabs:
//                it rises over the one left, as forward does, under the
//                header and the tabs, which stay put
export type PageTransition =
  | 'forward'
  | 'back'
  | 'return'
  | 'none'
  | 'zoom'
  | 'switch'
  | 'theme'
  | 'shelf'
  | 'view'
  | 'swap'
  | 'onward';

// back is done with a curtain over the page rather than a View Transition
export const usesCurtain = (kind: PageTransition) => kind === 'back';

// View Transitions read the kind off <html data-transition> to pick an animation
export function setPageTransition(kind: PageTransition) {
  document.documentElement.dataset.transition = kind;
}

// Going back through history (the Back button, the browser's own, a swipe)
// returns the way the reader came. The router animates it, as it did the
// way in; this only says how. Set before the router hears of it.
export function returnOnHistoryBack() {
  window.addEventListener('popstate', (e) => {
    // Safari's swipe back already slides the page away itself
    const own = (e as PopStateEvent & { hasUAVisualTransition?: boolean })
      .hasUAVisualTransition;
    setPageTransition(own ? 'none' : 'return');
    if (!own) flyCoverHome();
  });
}
