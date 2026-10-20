// The two kinds of frosted panel that sit over the page

// Small controls floating over the content: the tabs, the search, the view
// and zoom choices
export const floatingClass =
  'border border-line/60 bg-surface/85 shadow-[0_14px_32px_-20px_rgba(40,28,14,0.5),0_2px_6px_-2px_rgba(40,28,14,0.1)] backdrop-blur-xl';

// A row (or column) of small controls, floating: the view choices, the
// order menu, the sky's zoom
export const capsuleClass = `rounded-full p-1 ${floatingClass}`;

// Panels that open over everything, like a menu or a calendar: more solid,
// and lifted higher
export const raisedClass =
  'border border-line/70 bg-surface/95 shadow-[0_22px_44px_-22px_rgba(40,28,14,0.55),0_2px_8px_rgba(40,28,14,0.08)] backdrop-blur-xl';
