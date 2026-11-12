import { asWork } from '@/entities/book/catalogueBook';
import type { AddBookState } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import type { ActivityKind, FeedItem } from '@/entities/reader/types';
import { Answer } from '@/entities/reader/ui/Answer';
import { callName } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { ago } from '@/shared/lib/dates';
import { Avatar } from '@/shared/ui/Avatar';
import { Stars } from '@/shared/ui/Stars';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { FeedEntry } from './FeedEntry';

// What each kind of thing is said as, after who did it
const said: Record<ActivityKind, string> = {
  added: 'added',
  started: 'started reading',
  finished: 'finished',
  reviewed: 'reviewed',
  liked: 'liked your review of',
  followed: 'started following you',
  asked: 'requested to follow you',
};

// One thing in the feed, as a line of news: who (their photo, a way to
// their page), what they did and when; the book it was, a way to its page
// (the reader's own copy, for a heart on their review), with the stars
// given it or the review's first lines. New since the feed was last looked
// at (`fresh`), lit softly. Going anywhere from it, the feed closes
// (`onGo`).
export function FeedRow({
  item,
  fresh,
  onGo,
}: {
  item: Exclude<FeedItem, { kind: 'news' }>;
  fresh: boolean;
  onGo: () => void;
}) {
  const who = callName(item.reader);
  const page =
    item.kind === 'asked' ? paths.profile : paths.reader(item.reader.username);
  const book = item.book;
  return (
    <FeedEntry fresh={fresh} className='py-4'>
      <TransitionLink to={page} onClick={onGo} aria-hidden tabIndex={-1}>
        <Avatar name={who} url={item.reader.avatarUrl} />
      </TransitionLink>
      <div className='min-w-0 flex-1'>
        <p className='text-sm leading-snug'>
          <TransitionLink
            to={page}
            onClick={onGo}
            className='font-medium text-ink hover:underline'
          >
            {who}
          </TransitionLink>{' '}
          <span className='text-ink-soft'>{said[item.kind]}</span>
          {book && (
            <>
              {' '}
              <span className='font-serif italic text-ink'>{book.title}</span>
            </>
          )}
          <span className='text-muted'> · {ago(new Date(item.at))}</span>
        </p>
        {book?.rating && (
          <Stars value={book.rating} size={13} className='mt-1.5 -mx-0.5' />
        )}
        {item.kind === 'asked' && (
          <Answer username={item.reader.username} className='mt-2.5' />
        )}
        {book?.review && (
          <p className='mt-1.5 line-clamp-3 font-serif text-[0.9375rem] leading-relaxed text-ink-soft'>
            {book.review}
          </p>
        )}
      </div>
      {book && (
        <TransitionLink
          to={item.forYou ? paths.book(book.id) : paths.work(book.workKey)}
          state={
            item.forYou
              ? undefined
              : ({ work: asWork(book) } satisfies AddBookState)
          }
          onClick={onGo}
          aria-label={book.title}
          className='w-10 shrink-0'
        >
          <BookCover
            title={book.title}
            author={book.authors[0]}
            url={book.coverUrl}
            className='shadow-[0_6px_12px_-8px_rgb(var(--shade)/calc(0.6*var(--shade-k)))]'
          />
        </TransitionLink>
      )}
    </FeedEntry>
  );
}
