import type { LucideIcon } from 'lucide-react';

// A small icon in a ring, as a stop on a line (a place's way down, a
// copy's story) or beside what it stands for
export function IconDot({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className='grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-soft'>
      <Icon size={16} strokeWidth={1.5} />
    </span>
  );
}
