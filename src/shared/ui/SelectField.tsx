import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from './fieldStyles';

type SelectFieldProps = ComponentProps<'select'> & { label: string };

// A native select dressed like TextField: small caps label, underline
export function SelectField({
  label,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-2', className)}>
      <span className={labelClass}>{label}</span>
      <span className='relative flex items-center border-b border-line transition-colors duration-500 ease-soft focus-within:border-ink'>
        <select
          className='w-full cursor-pointer appearance-none truncate bg-transparent py-2 pr-7 text-base text-ink outline-none disabled:cursor-default sm:py-2.5'
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className='pointer-events-none absolute right-1 text-faint'
        />
      </span>
    </label>
  );
}
