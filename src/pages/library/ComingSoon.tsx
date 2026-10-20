import { cn } from '@/shared/lib/cn';
import { Eyebrow, Lead, PageTitle } from '@/shared/ui/PageHeading';
import { plans } from './plans';
import type { SectionKey } from './sections';

// A section that isn't built yet: what it's for, and a faint glimpse of it
export function ComingSoon({
  section,
}: {
  section: Exclude<SectionKey, 'all'>;
}) {
  const plan = plans[section];
  return (
    // Keyed, so switching sections plays the entrance again
    <div key={section} className='flex flex-col items-center text-center'>
      <Eyebrow rise={0}>Coming soon</Eyebrow>
      <PageTitle rise={60} className='mt-3 max-w-2xl sm:mt-4'>
        {plan.title}
      </PageTitle>
      <Lead rise={120} className='mt-5 max-w-lg'>
        {plan.text}
      </Lead>
      <ul
        className={cn(
          'mt-12 grid w-full gap-4 text-left sm:grid-cols-2 lg:gap-5',
          plan.cards.length > 3
            ? 'max-w-6xl lg:grid-cols-4'
            : 'max-w-4xl lg:grid-cols-3',
        )}
      >
        {plan.cards.map((card, i) => (
          <li
            key={card.title}
            className='animate-rise rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-5'
            style={{ animationDelay: `${180 + i * 60}ms` }}
          >
            <p className='font-serif text-lg leading-snug tracking-[-0.01em] text-ink-soft'>
              {card.title}
            </p>
            <p className='mt-1.5 text-sm leading-6 text-muted'>{card.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
