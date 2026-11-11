import { Avatar } from '@/shared/ui/Avatar';
import { callName, handle, type Reader } from '../types';

// A reader in a list of them: their photo (or initial), what they're
// called, and under it their @username, when they're called by a name
export function ReaderLine({ reader }: { reader: Omit<Reader, 'you'> }) {
  return (
    <>
      <Avatar name={callName(reader)} url={reader.avatarUrl} />
      <span className='min-w-0'>
        <span className='block truncate text-sm text-ink'>
          {callName(reader)}
        </span>
        {reader.name && (
          <span className='block truncate text-xs text-muted'>
            {handle(reader.username)}
          </span>
        )}
      </span>
    </>
  );
}
