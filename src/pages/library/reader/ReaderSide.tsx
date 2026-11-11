import { useState } from 'react';
import type { ReaderPage } from '@/entities/reader/types';
import { callName, handle } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { Portrait } from '@/shared/ui/Portrait';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { FollowButton } from './FollowButton';
import { PeopleDrawer } from './PeopleDrawer';

// Who a reader is, beside their page as a writer's photo and years are
// beside theirs: their photo, name and @username, what they say of
// themselves, how many books they have and have read, and how many follow them and they follow (each opening who,
// in a drawer); then, on their own page, the ways to change it, and on
// another's, following them
export function ReaderSide({ page }: { page: ReaderPage }) {
  // Who's shown in the drawer, kept as it closes so its title stays put
  const [side, setSide] = useState<'followers' | 'following'>('followers');
  const [open, setOpen] = useState(false);
  const name = callName(page);
  const counts: {
    label: string;
    value: number | null;
    side?: 'followers' | 'following';
  }[] = [
    { label: 'Followers', value: page.counts.followers, side: 'followers' },
    { label: 'Following', value: page.counts.following, side: 'following' },
    { label: 'Books', value: page.counts.books },
    { label: 'Read', value: page.counts.read },
  ];

  // As a column on a wide screen; on a phone as photos apps lay a profile
  // out: a small photo with the numbers beside it, then who they are, then
  // the buttons across
  const area = (name: string) => ({ gridArea: name });
  return (
    <div className="grid animate-rise grid-cols-[auto_1fr] items-center gap-x-6 [grid-template-areas:'photo_counts''text_text''actions_actions'] lg:grid-cols-1 lg:items-start lg:[grid-template-areas:'photo''text''counts''actions']">
      {/* Their photo, round, opening up to fill the screen as a writer's
          does */}
      <div style={area('photo')}>
        <Portrait
          key={page.avatarUrl}
          name={name}
          url={page.avatarUrl ?? undefined}
          round
          className='w-24 sm:w-28 lg:w-full'
        />
      </div>
      <div style={area('text')} className='mt-4 lg:mt-6'>
        <h1 className='font-serif text-[1.6rem] leading-[1.1] tracking-[-0.02em] lg:text-[2.4rem] lg:leading-[1.05]'>
          {name}
        </h1>
        {page.name && (
          <p className='mt-0.5 text-sm text-muted lg:mt-1 lg:text-[0.9375rem]'>
            {handle(page.username)}
          </p>
        )}
        {page.about && (
          <p className='mt-2 max-w-sm font-serif text-[0.9375rem] leading-relaxed text-ink-soft lg:mt-3'>
            {page.about}
          </p>
        )}
      </div>
      <ul
        style={area('counts')}
        className='grid grid-cols-2 gap-x-3 gap-y-3 lg:mt-6 lg:gap-x-5 lg:gap-y-4'
      >
        {counts.map(({ label, value, side }) => {
          // A number they don't let be seen isn't there at all
          if (value === null) return null;
          const figure = (
            <>
              <span className='font-serif text-xl leading-none tabular-nums lining-nums lg:text-[1.625rem]'>
                {value.toLocaleString('en')}
              </span>
              <span className='text-xs text-muted lg:uppercase lg:tracking-[0.14em]'>
                {label}
              </span>
            </>
          );
          const shape =
            'flex flex-col items-center gap-0.5 lg:items-start lg:gap-1';
          // Who they are, for those who may open the page
          return side && page.open ? (
            <li key={label}>
              <button
                type='button'
                onClick={() => {
                  setSide(side);
                  setOpen(true);
                }}
                className={cn(
                  shape,
                  'w-full cursor-pointer rounded-lg outline-offset-4 transition-colors duration-500 ease-soft hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-ink',
                )}
              >
                {figure}
              </button>
            </li>
          ) : (
            <li key={label} className={shape}>
              {figure}
            </li>
          );
        })}
      </ul>
      <div style={area('actions')} className='mt-5 lg:mt-6'>
        {page.you ? (
          <>
            <div className='flex gap-2 max-lg:*:flex-1 lg:flex-wrap'>
              <ButtonLink variant='pill' to={`${paths.settings}#profile`}>
                Edit profile
              </ButtonLink>
              <ButtonLink variant='pill' to={`${paths.settings}#page`}>
                Who sees what
              </ButtonLink>
            </div>
            <p className='mt-3 max-w-xs text-xs leading-relaxed text-faint'>
              This is how other readers see your page. The chips say who sees
              each part.
            </p>
          </>
        ) : (
          <div className='flex items-center gap-3'>
            <FollowButton page={page} className='max-lg:flex-1' />
            {page.followsYou && (
              <span className='shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted'>
                Follows you
              </span>
            )}
          </div>
        )}
      </div>
      <PeopleDrawer
        username={page.username}
        side={side}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
