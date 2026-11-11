import type { ReactNode } from 'react';

// One part of a page (a book's, a writer's, a reader's), under its
// heading: set in spaced capitals, as a chapter's in an old book, with a
// hairline running on from it across the page, and `aside` at its end, if
// anything
export function TitledSection({
  id,
  title,
  aside,
  children,
  className,
}: {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className='mb-6 flex items-center gap-4'>
        <h2 className='font-serif text-[0.9375rem] uppercase tracking-[0.18em] text-ink'>
          {title}
        </h2>
        <span aria-hidden className='h-px flex-1 bg-line' />
        {aside}
      </div>
      {children}
    </section>
  );
}
