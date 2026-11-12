import type { News } from '@/entities/news/types';
import { NewsText } from '@/entities/news/ui/NewsText';
import { cn } from '@/shared/lib/cn';
import { ago } from '@/shared/lib/dates';
import { textLinkClass } from '@/shared/ui/buttonStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { FeedEntry } from './FeedEntry';

// A piece of alcove's own news in the feed: from alcove (its mark), when,
// its headline and few lines, and its way on (a page of alcove, or out to
// the web in a new tab), the feed closing as it's taken (`onGo`). New
// since the feed was last looked at (`fresh`), lit softly.
export function NewsRow({
  news,
  fresh,
  onGo,
}: {
  news: News;
  fresh: boolean;
  onGo: () => void;
}) {
  const link = news.link;
  const way = cn('mt-2 inline-flex text-sm text-ink', textLinkClass);
  return (
    <FeedEntry fresh={fresh} className='py-5'>
      <span className='grid size-8 shrink-0 place-items-center rounded-full bg-button font-serif text-[0.9375rem] tracking-[-0.04em] text-button-text'>
        <span>
          a<span className='text-accent'>.</span>
        </span>
      </span>
      <div className='min-w-0'>
        <p className='text-sm'>
          <b className='font-medium'>alcove</b>
          <span className='text-muted'> · news · {ago(new Date(news.at))}</span>
        </p>
        <NewsText news={news} className='tracking-[-0.01em]' />
        {link &&
          (link.to.startsWith('/') ? (
            <TransitionLink to={link.to} onClick={onGo} className={way}>
              {link.label} →
            </TransitionLink>
          ) : (
            <a href={link.to} target='_blank' rel='noreferrer' className={way}>
              {link.label} ↗
            </a>
          ))}
      </div>
    </FeedEntry>
  );
}
