import { useBooks } from '@/entities/book/queries';
import { callName, handle, type User } from '@/entities/user/types';
import { paths } from '@/shared/config/paths';
import { counted } from '@/shared/lib/plural';
import { Avatar } from '@/shared/ui/Avatar';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { rowLinkClass } from './rowLink';
import { SettingsGroup } from './SettingsGroup';

// Who the reader is in alcove, as a card: their circle, what they're called
// and found by, and how many books they keep here. All of it, and who sees
// what of their page, is changed on the page itself.
export function ProfileGroup({ user, delay }: { user: User; delay: number }) {
  const total = useBooks().data?.pages[0]?.total;
  const facts = [
    user.name && user.username && handle(user.username),
    total !== undefined && counted(total, 'book'),
  ].filter(Boolean);

  return (
    <SettingsGroup
      id='profile'
      title='Profile'
      aside={
        <TransitionLink to={paths.profile} className={rowLinkClass}>
          Edit on your page →
        </TransitionLink>
      }
      delay={delay}
    >
      <div className='flex items-center gap-4 px-5 py-5 sm:gap-5 sm:px-6'>
        <Avatar name={callName(user)} url={user.avatarUrl} size='lg' />
        <div className='min-w-0'>
          <p className='truncate font-serif text-2xl tracking-[-0.02em]'>
            {callName(user) || 'You'}
          </p>
          <p className='mt-0.5 text-[0.8125rem] text-muted'>
            {facts.join(' · ')}
          </p>
        </div>
      </div>
    </SettingsGroup>
  );
}
