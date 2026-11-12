import { useState } from 'react';
import type { ReaderPage } from '@/entities/reader/types';
import { callName, handle } from '@/entities/user/types';
import { Portrait } from '@/shared/ui/Portrait';
import { useAuth } from '@/features/auth';
import { ProfileEditor } from '@/features/edit-profile';
import { Button } from '@/shared/ui/Button';
import { FollowButton } from './FollowButton';
import { PeopleDrawer } from './PeopleDrawer';

// Who a reader is, beside their page as a writer's photo and years are
// beside theirs, as photo apps lay a profile out: their photo (opening up
// to fill the screen) with their name and @username beside it; under them
// in one line (on a wide screen, in three columns between rules) how many
// books they have, how many follow them and how many they follow (each of
// those opening who, in a drawer); what they say of themselves; then, on
// their own page, the way to change it (all of it changed in its place:
// ProfileEditor), and on another's, following them
export function ReaderSide({ page }: { page: ReaderPage }) {
  const { user } = useAuth();
  // Who's shown in the drawer, kept as it closes so its title stays put
  const [side, setSide] = useState<'followers' | 'following'>('followers');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  if (editing && page.you && user)
    return <ProfileEditor user={user} onClose={() => setEditing(false)} />;
  const name = callName(page);
  const counts: {
    label: string;
    value: number | null;
    side?: 'followers' | 'following';
  }[] = [
    { label: 'books', value: page.counts.books },
    { label: 'followers', value: page.counts.followers, side: 'followers' },
    { label: 'following', value: page.counts.following, side: 'following' },
  ];

  return (
    <div className='flex animate-rise flex-col'>
      <div className='flex items-center gap-4'>
        <Portrait
          key={page.avatarUrl}
          name={name}
          url={page.avatarUrl ?? undefined}
          round
          className='w-[4.75rem] shrink-0 lg:w-[5.5rem]'
        />
        <div className='min-w-0'>
          <h1 className='font-serif text-[1.4rem] leading-[1.15] tracking-[-0.02em] [overflow-wrap:anywhere] lg:text-[1.6rem] lg:leading-[1.1]'>
            {name}
          </h1>
          {page.name && (
            <p className='mt-0.5 truncate text-sm text-muted lg:mt-1 lg:text-[0.9375rem]'>
              {handle(page.username)}
            </p>
          )}
        </div>
      </div>
      <ul className='mt-4 flex flex-wrap gap-x-3.5 gap-y-1 text-sm text-muted lg:mt-6 lg:grid lg:grid-cols-3 lg:gap-2 lg:border-y lg:border-line/70 lg:py-4 lg:text-[0.8125rem]'>
        {counts.map(({ label, value, side }) => {
          // A number they don't let be seen isn't there at all
          if (value === null) return null;
          const figure = (
            <>
              <span className='mr-1 font-serif text-[0.9375rem] font-semibold tabular-nums lining-nums text-ink lg:mr-0 lg:block lg:text-[1.375rem] lg:leading-tight'>
                {value.toLocaleString('en')}
              </span>
              {label}
            </>
          );
          // Who they are, for those who may open the page
          return (
            <li key={label}>
              {side && page.open ? (
                <button
                  type='button'
                  onClick={() => {
                    setSide(side);
                    setOpen(true);
                  }}
                  className='cursor-pointer rounded text-left outline-offset-2 transition-colors duration-500 ease-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-ink'
                >
                  {figure}
                </button>
              ) : (
                figure
              )}
            </li>
          );
        })}
      </ul>
      {page.about && (
        <p className='mt-3 max-w-sm font-serif text-[0.9375rem] leading-relaxed text-ink-soft lg:mt-4 lg:text-base'>
          {page.about}
        </p>
      )}
      <div className='mt-5 lg:mt-7'>
        {page.you ? (
          <Button
            variant='pill'
            onClick={() => setEditing(true)}
            className='max-lg:w-full'
          >
            Edit profile
          </Button>
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
