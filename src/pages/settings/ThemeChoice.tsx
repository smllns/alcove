import { useTheme, type ThemeChoice as Choice } from '@/shared/theme';
import { cn } from '@/shared/lib/cn';

// `short`: what fits under it on a phone
const choices: { value: Choice; label: string; short: string }[] = [
  { value: 'light', label: 'Warm paper', short: 'Light' },
  { value: 'dark', label: 'Lamplight', short: 'Dark' },
  { value: 'system', label: 'As my device', short: 'Auto' },
];
// A few books on its shelf, in the colours covers without a picture get
const covers = ['#5b6b7a', '#7a5d46', '#4f5e48'];

// A little page of the library in one theme's own palette, whichever is on
// now (data-palette, theme.css)
function PagePreview({ palette }: { palette: 'light' | 'dark' }) {
  return (
    <span
      aria-hidden
      data-palette={palette}
      className='bg-paper flex h-full min-w-0 flex-1 flex-col gap-1.5 p-2.5'
    >
      <i className='block h-1 w-3/5 rounded-full bg-ink/55' />
      <i className='block h-1 w-2/5 rounded-full bg-ink/55' />
      <span className='mt-auto flex gap-1'>
        {covers.map((cover) => (
          <span
            key={cover}
            className='h-4.5 w-3 shrink-0 rounded-[2px]'
            style={{ background: cover }}
          />
        ))}
      </span>
    </span>
  );
}

// Light, dark, or as the device is (and along with it as it changes), each
// shown as a little page; the new look spreading out from the choice made
export function ThemeChoice() {
  const { choice, choose } = useTheme();
  return (
    <div
      role='radiogroup'
      aria-label='Theme'
      className='flex gap-2.5 px-5 py-5 sm:gap-3 sm:px-6'
    >
      {choices.map(({ value, label, short }) => {
        const on = value === choice;
        return (
          <button
            key={value}
            type='button'
            role='radio'
            aria-checked={on}
            aria-label={label}
            onClick={(e) => !on && choose(value, e.currentTarget)}
            className={cn(
              'min-w-0 flex-1 cursor-pointer rounded-2xl border bg-surface/70 p-2 text-left text-[13px] transition-[border-color,box-shadow] duration-500 ease-soft sm:w-36 sm:flex-none',
              on
                ? 'border-ink shadow-[0_0_0_1px_var(--ink)]'
                : 'border-line hover:border-ink/50',
            )}
          >
            <span className='mb-2 flex h-16 overflow-hidden rounded-lg'>
              {value === 'system' ? (
                <>
                  <PagePreview palette='light' />
                  <PagePreview palette='dark' />
                </>
              ) : (
                <PagePreview palette={value} />
              )}
            </span>
            <span className='block truncate px-1'>
              <span className='sm:hidden'>{short}</span>
              <span className='max-sm:hidden'>{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
