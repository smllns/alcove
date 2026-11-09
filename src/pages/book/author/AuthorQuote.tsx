import { SourceCredit } from '../SourceCredit';

// Words of the writer's own, closing their page, and where they're from
export function AuthorQuote({
  quote,
  source,
}: {
  quote: string;
  source: string;
}) {
  return (
    <figure className='max-w-2xl'>
      <blockquote className='border-l-2 border-gold pl-5 font-serif text-xl leading-relaxed text-pretty text-ink italic sm:text-2xl sm:leading-relaxed'>
        {quote}
      </blockquote>
      <SourceCredit source='Wikiquote' href={source} className='mt-3 pl-5' />
    </figure>
  );
}
