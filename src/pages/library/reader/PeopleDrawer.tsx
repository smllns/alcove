import { usePeople } from '@/entities/reader/queries';
import { ReaderLine } from '@/entities/user/ui/ReaderLine';
import { useAuth } from '@/features/auth';
import { paths } from '@/shared/config/paths';
import { Drawer } from '@/shared/ui/Drawer';
import { FormError } from '@/shared/ui/FormError';
import { Spinner } from '@/shared/ui/Spinner';
import { TransitionLink } from '@/shared/ui/TransitionLink';

// Who follow a reader, or who they follow, in a drawer: each opening their
// own page (the reader's own, their profile)
export function PeopleDrawer({
  username,
  side,
  open,
  onClose,
}: {
  username: string;
  side: 'followers' | 'following';
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const people = usePeople(username, side, open);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={side === 'following' ? 'Following' : 'Followers'}
    >
      <div className='px-4 py-4'>
        {people.isPending ? (
          <div className='grid place-items-center py-10'>
            <Spinner />
          </div>
        ) : people.isError ? (
          <FormError message={people.error.message} className='px-2' />
        ) : !people.data.length ? (
          <p className='px-2 py-8 text-center text-sm text-muted'>
            No one yet.
          </p>
        ) : (
          <ul className='flex flex-col'>
            {people.data.map((reader) => (
              <li key={reader.username}>
                <TransitionLink
                  to={
                    reader.username === user?.username
                      ? paths.profile
                      : paths.reader(reader.username)
                  }
                  onClick={onClose}
                  className='flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-300 ease-soft hover:bg-ink/5'
                >
                  <ReaderLine reader={reader} />
                </TransitionLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
