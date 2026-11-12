import { cn } from '@/shared/lib/cn';
import type { News } from '../types';

// A piece of news as it reads: its headline (set as `className` adds to it)
// and its few lines under it
export function NewsText({
  news,
  className,
}: {
  news: Pick<News, 'title' | 'body'>;
  className?: string;
}) {
  return (
    <>
      <h3 className={cn('mt-1 font-serif text-lg leading-snug', className)}>
        {news.title}
      </h3>
      <p className='mt-1 whitespace-pre-line text-sm leading-6 text-muted'>
        {news.body}
      </p>
    </>
  );
}
