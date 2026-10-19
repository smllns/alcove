import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type SettingsSectionProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'danger';
  // Entrance order
  delay?: number;
};

// One block of settings: what it is on the left, the form on the right
export function SettingsSection({
  title,
  description,
  children,
  tone = 'default',
  delay = 0,
}: SettingsSectionProps) {
  return (
    <section
      className='grid animate-rise gap-6 border-t border-line py-10 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-12'
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <h2
          className={cn(
            'font-serif text-2xl tracking-[-0.03em]',
            tone === 'danger' && 'text-danger',
          )}
        >
          {title}
        </h2>
        <p className='mt-2 text-sm leading-6 text-muted'>{description}</p>
      </div>
      <div className='min-w-0'>{children}</div>
    </section>
  );
}
