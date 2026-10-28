// The two kinds of frosted panel that sit over the page

// Small controls floating over the content: the tabs, the search, the view
// and zoom choices
export const floatingClass =
  'border border-line/60 bg-surface/85 shadow-[0_14px_32px_-20px_rgba(40,28,14,0.5),0_2px_6px_-2px_rgba(40,28,14,0.1)] backdrop-blur-xl';

// A row (or column) of small controls, floating: the view choices, the
// order menu, the sky's zoom
export const capsuleClass = `rounded-full p-1 ${floatingClass}`;

// Panels that open over everything, like a menu or a calendar: frosted
// glass, what's under it blurred, and lifted higher
const raisedShadow =
  'shadow-[0_22px_44px_-22px_rgba(40,28,14,0.55),0_2px_8px_rgba(40,28,14,0.08)]';
export const raisedClass = `border border-line/70 bg-surface/75 ${raisedShadow} backdrop-blur-xl backdrop-saturate-150`;

// The same, quite solid, for panels big enough that the page showing
// through would muddle them: a search, a drawer
export const solidRaisedClass = `border border-line/70 bg-surface ${raisedShadow}`;

// A large frosted sheet for text to sit on over a busy background (a
// book's page, over the light of its cover): see-through enough to let the
// colour show, blurred enough to read on as easily as plain paper. A halo
// of paper around it in the light (a soft shadow in the dark) and a bright
// edge along its top, like glass.
export const sheetClass =
  'rounded-[28px] border border-white/20 bg-surface/50 shadow-[0_0_80px_-10px_rgb(var(--glow)/0.6),inset_0_1px_0_rgb(255_255_255/0.2),0_40px_80px_-50px_rgb(var(--shade)/calc(0.35*var(--shade-k)))] backdrop-blur-2xl dark:border-white/6 dark:bg-surface/50 dark:shadow-[0_0_80px_-10px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.05),0_40px_80px_-50px_rgb(0_0_0/0.7)]';

// A sheet of old paper lying on the page (a notebook page, a catalogue
// card): the paper itself (aged-paper, index.css) and the thin shadow it
// casts
export const paperClass =
  'aged-paper shadow-[0_1px_2px_rgb(var(--shade)/calc(0.12*var(--shade-k))),0_10px_24px_-18px_rgb(var(--shade)/calc(0.4*var(--shade-k)))]';

// A plain card drawn in outline only, for things grouped together inside a
// sheet: where a copy lives, a link
export const outlineCardClass = 'rounded-2xl border border-line/60';

// A word to the reader in the course of a form, set apart on a pale card
export const noticeClass =
  'rounded-2xl border border-line bg-surface/70 px-5 py-4';

// The room a page's content takes: across the screen inside its margins,
// up to a width past which it stops spreading and sits in the middle
export const pageWidthClass =
  'mx-auto w-full max-w-[88rem] px-6 sm:px-10 lg:px-16';
