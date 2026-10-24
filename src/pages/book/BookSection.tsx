import type { ReactNode } from 'react';

// One part of a book's page, under its heading: set in spaced capitals, as
// a chapter's in an old book, with a hairline running on from it across
// the page
export function BookSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className='mb-6 flex items-center gap-4'>
        <h2 className='font-serif text-[15px] uppercase tracking-[0.18em] text-ink'>
          {title}
        </h2>
        <span aria-hidden className='h-px flex-1 bg-line' />
      </div>
      {children}
    </section>
  );
}
