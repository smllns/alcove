import { gsap } from 'gsap';

// GSAP, set up once for the whole app: a slow frame (the page laid out
// afresh just as something starts moving, on a phone most of all) counted
// as an ordinary one, so nothing leaps ahead over it
gsap.ticker.lagSmoothing(50, 16);

export { gsap };
