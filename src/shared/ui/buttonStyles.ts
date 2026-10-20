import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'pill' | 'danger';

const variants: Record<ButtonVariant, string> = {
  primary:
    'min-h-11 gap-2.5 bg-button px-6 py-2.5 text-button-text sm:min-h-12 sm:gap-3 sm:px-7 sm:py-3 text-shadow-none hover:bg-button-hover',
  secondary:
    'min-h-11 border border-line/80 bg-surface/75 px-6 py-2.5 text-ink-soft sm:min-h-12 sm:px-7 sm:py-3 backdrop-blur-sm hover:border-ink hover:text-ink',
  // For things that can't be undone
  danger:
    'min-h-11 gap-2.5 border border-danger/60 px-6 py-2.5 text-danger text-shadow-none sm:min-h-12 sm:px-7 sm:py-3 hover:border-danger hover:bg-danger hover:text-button-text',
  pill: 'gap-2 border border-line bg-surface/85 px-4 py-2 text-[13px] backdrop-blur-sm sm:px-5 sm:py-2.5 sm:text-sm hover:border-ink',
};

// Shared by <Button> and <ButtonLink>, so a link and a button can look alike
export const buttonClass = (variant: ButtonVariant, className?: string) =>
  cn(
    'group pointer-events-auto inline-flex cursor-pointer items-center justify-center rounded-full text-sm transition-all duration-500 ease-soft disabled:cursor-default disabled:opacity-60',
    variants[variant],
    className,
  );

// Round, outlined control for a single icon; shared with icon links
export const iconButtonClass = (className?: string) =>
  cn(
    'group grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface/85 backdrop-blur-sm transition-colors duration-500 ease-soft hover:border-ink sm:size-10',
    className,
  );

// One pill, chosen or not; for <Choices> and pill toggles built elsewhere
export const choiceClass = (chosen: boolean) =>
  cn(
    'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-500 ease-soft',
    chosen
      ? 'border-button bg-button text-button-text'
      : 'border-line bg-surface/70 text-ink-soft hover:border-ink hover:text-ink',
  );
