import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'pill' | 'danger';

const variants: Record<ButtonVariant, string> = {
  primary:
    'min-h-11 [--gap:--spacing(2.5)] bg-button px-6 py-2.5 text-button-text sm:min-h-12 sm:[--gap:--spacing(3)] sm:px-7 sm:py-3 text-shadow-none hover:bg-button-hover',
  secondary:
    'min-h-11 [--gap:--spacing(2.5)] sm:[--gap:--spacing(3)] border border-line/80 bg-surface/75 px-6 py-2.5 text-ink-soft sm:min-h-12 sm:px-7 sm:py-3 backdrop-blur-sm hover:border-ink hover:text-ink',
  // For things that can't be undone
  danger:
    'min-h-11 [--gap:--spacing(2.5)] border border-danger/60 px-6 py-2.5 text-danger text-shadow-none sm:min-h-12 sm:px-7 sm:py-3 hover:border-danger hover:bg-danger hover:text-button-text',
  pill: '[--gap:--spacing(2)] border border-line bg-surface/85 px-4 py-2 text-[13px] backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-sm hover:border-ink',
};

// Shared by <Button> and <ButtonLink>, so a link and a button can look alike.
// The space between a label and its icon is --gap, for a spinner to fold
// away into (Button). Busy (its spinner turning), it isn't dimmed as one
// that's simply off is: the spinner says so, and Safari, fading a button
// as it widens for its spinner, leaves the new part on the right paler
export const buttonClass = (variant: ButtonVariant, className?: string) =>
  cn(
    'group pointer-events-auto inline-flex gap-(--gap) cursor-pointer items-center justify-center rounded-full text-sm transition-all duration-500 ease-soft disabled:cursor-default disabled:not-aria-busy:opacity-60',
    variants[variant],
    className,
  );

// Round, outlined control for a single icon; shared with icon links
export const iconButtonClass = (className?: string) =>
  cn(
    'group grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface/85 backdrop-blur-sm transition-colors duration-500 ease-soft hover:border-ink sm:size-10',
    className,
  );

const choiceBase =
  'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-500 ease-soft';

// One pill, chosen or not; for <Choices> and pill toggles built elsewhere
export const choiceClass = (chosen: boolean) =>
  cn(
    choiceBase,
    chosen
      ? 'border-button bg-button text-button-text'
      : 'border-line bg-surface/85 text-ink-soft backdrop-blur-sm hover:border-ink hover:text-ink',
  );

// The same in a colour of its own, set as --tone: filled with it once
// chosen, and edged with it on hover
export const toneChoiceClass = (chosen: boolean) =>
  cn(
    choiceBase,
    'flex items-center gap-2',
    chosen
      ? 'border-(--tone) bg-(--tone) text-button-text'
      : 'border-line bg-surface/70 text-ink-soft hover:border-(--tone) hover:text-ink',
  );

// A quiet round button that only shows a soft pill on hover, or when it's
// the one chosen: the tabs, the view and zoom choices, a calendar's arrows
export const softClass = (on = false, className?: string) =>
  cn(
    'cursor-pointer rounded-full transition-colors duration-500 ease-soft',
    on ? 'bg-ink/7 text-ink' : 'text-muted hover:bg-ink/5 hover:text-ink',
    className,
  );

// Words in a line of text that lead somewhere or do something: a fine
// underline, darkening along with them on hover. The colour of the words is
// the caller's.
export const textLinkClass =
  'cursor-pointer underline decoration-line underline-offset-4 transition-colors duration-500 ease-soft hover:text-ink hover:decoration-ink';
