import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { labelClass } from '@/shared/ui/fieldStyles';
import { rowLinkClass } from './rowLink';

// A setting as it is now, in a row of its group's sheet: what it is, what
// it's set to, and a way to change it, opening its form (`children`) under
// the row; or, in place of that, an `action` of its own
export function SettingRow({
  label,
  value,
  action,
  children,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className='border-t border-line/70 first:border-t-0'>
      {/* On a phone, what it is over its value, the action beside both */}
      <div className='grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[10rem_1fr_auto] sm:px-6'>
        <span className={labelClass}>{label}</span>
        {/* Changing, its form under it shows it in its place */}
        <span
          className={cn(
            'col-start-1 row-start-2 min-w-0 truncate text-sm text-ink transition-opacity duration-500 ease-soft sm:col-start-2 sm:row-start-1',
            open && children !== undefined && 'opacity-0',
          )}
        >
          {value}
        </span>
        <div className='col-start-2 row-span-2 row-start-1 justify-self-end sm:col-start-3 sm:row-span-1'>
          {action ??
            (children && (
              <button
                type='button'
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className={rowLinkClass}
              >
                {open ? 'Close' : 'Change'}
              </button>
            ))}
        </div>
      </div>
      {children && (
        <Collapse open={open}>
          {/* Under the value, level with it */}
          <div className='px-5 pb-6 pt-1 sm:pl-52 sm:pr-6'>{children}</div>
        </Collapse>
      )}
    </div>
  );
}
