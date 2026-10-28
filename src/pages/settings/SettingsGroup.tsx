import type { ReactNode } from 'react';
import { sheetClass } from '@/shared/ui/surfaces';

// One group of settings: its name, and under it a sheet of the settings
// themselves (SettingRow), as a room's shelves sit on theirs. `id`: where
// the index leads to (SettingsIndex). `aside`: a word or a link on the
// right of the name.
export function SettingsGroup({
  id,
  title,
  aside,
  delay,
  children,
}: {
  id: string;
  title: string;
  aside?: ReactNode;
  // Entrance order
  delay: number;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className='scroll-mt-28 animate-rise'
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className='mb-3 flex items-baseline justify-between gap-4 px-1'>
        <h2 className='font-serif text-[22px] tracking-[-0.02em]'>{title}</h2>
        {aside}
      </div>
      <div className={sheetClass}>{children}</div>
    </section>
  );
}
