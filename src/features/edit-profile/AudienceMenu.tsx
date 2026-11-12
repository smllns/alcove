import { useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, Globe, Lock, Users } from 'lucide-react';
import type { Audience, PagePart } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/lib/cn';
import { FormError } from '@/shared/ui/FormError';
import { Popover } from '@/shared/ui/Popover';
import { usePrivacy } from './usePrivacy';

const audiences: { value: Audience; label: string; icon: ReactNode }[] = [
  { value: 'everyone', label: 'Everyone', icon: <Globe size={12} /> },
  { value: 'followers', label: 'Followers', icon: <Users size={12} /> },
  { value: 'me', label: 'Only you', icon: <Lock size={12} /> },
];

// On the reader's own page, at the end of a part's heading: who sees that
// part, as a chip; tapped, the three choices under it, the one chosen saved
// at once (usePrivacy)
export function AudienceMenu({ part }: { part: PagePart }) {
  const { user } = useAuth();
  const chip = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { privacy, change, error } = usePrivacy(user!);
  const current = audiences.find((each) => each.value === privacy[part])!;
  return (
    <span className='relative flex shrink-0 flex-col items-end'>
      <button
        ref={chip}
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={`Who sees this: ${current.label}`}
        onClick={() => setOpen((was) => !was)}
        className='flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface/80 px-2.5 py-1 text-xs text-muted transition-colors duration-500 ease-soft hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-ink'
      >
        {current.icon}
        {current.label}
        <ChevronDown size={12} />
      </button>
      <Popover
        open={open}
        anchor={chip}
        onClose={() => setOpen(false)}
        width={168}
      >
        <ul role='menu' className='flex flex-col p-1'>
          {audiences.map(({ value, label, icon }) => (
            <li key={value}>
              <button
                type='button'
                role='menuitemradio'
                aria-checked={value === current.value}
                onClick={() => {
                  setOpen(false);
                  if (value !== current.value) void change({ [part]: value });
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-300 ease-soft hover:bg-ink/6 focus-visible:bg-ink/6 focus-visible:outline-none',
                  value === current.value ? 'text-ink' : 'text-ink-soft',
                )}
              >
                {icon}
                <span className='flex-1'>{label}</span>
                {value === current.value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
      <FormError message={error} small className='mt-1' />
    </span>
  );
}
