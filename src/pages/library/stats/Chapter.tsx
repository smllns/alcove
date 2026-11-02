import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { SectionTag } from '../places/drawing/SectionTag';

// The sentence a chapter opens with
export const sayClass =
  'max-w-xl font-serif text-lg leading-relaxed text-ink-soft';

// One chapter of the stats: its number in a ring and its title, a sentence saying what
// it found, and one drawing showing it, set in under the title (on a
// phone, as wide as the page). Without `say`, the drawing says its own.
export function Chapter({
  id,
  number,
  title,
  say,
  children,
  className,
}: {
  // Where the contents lead to it
  id?: string;
  // Its place among the chapters shown, from 1
  number: number;
  title: string;
  say?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('min-w-0', className)}>
      <h2 className='flex items-center gap-3.5 font-serif text-[1.75rem] leading-tight tracking-[-0.02em]'>
        {/* Numbered as the places tag a room in the drawing of a home */}
        <SectionTag className='font-sans'>{number}</SectionTag>
        {title}
      </h2>
      <div className='sm:pl-9'>
        {say && <p className={cn('mt-2.5', sayClass)}>{say}</p>}
        <div className={cn(say ? 'mt-7' : undefined)}>{children}</div>
      </div>
    </section>
  );
}

// A number or a name the sentence turns on
export function Mark({ children }: { children: ReactNode }) {
  return <span className='stats-mark'>{children}</span>;
}
