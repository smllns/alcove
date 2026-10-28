import type { ReactNode } from 'react';
import { labelClass } from '@/shared/ui/fieldStyles';
import { Spinner } from '@/shared/ui/Spinner';
import { textLinkClass } from '@/shared/ui/buttonStyles';
import { cn } from '@/shared/lib/cn';

// One kind of thing found: its name, and a way to see all of it when only
// the first few are shown (`onMore`). Looking, it says so (`waiting`) until
// the first are in; a spinner by its name as fresher ones come. With none
// found and nothing being looked for, it's not there at all.
export function SearchSection({
  title,
  loading,
  waiting,
  count,
  onMore,
  children,
}: {
  title: string;
  loading?: boolean;
  waiting: string;
  // How many are shown
  count: number;
  onMore?: () => void;
  children: ReactNode;
}) {
  if (!count && !loading) return null;
  return (
    <section className='animate-arrive pt-4 first:pt-2'>
      <div className='flex h-6 items-center gap-2 px-3'>
        <h3 className={labelClass}>{title}</h3>
        <span className='text-faint'>
          {loading && count > 0 && <Spinner />}
        </span>
        {onMore && (
          <button
            type='button'
            onClick={onMore}
            className={cn('ml-auto text-xs text-muted', textLinkClass)}
          >
            See all
          </button>
        )}
      </div>
      <ul className='mt-1 flex flex-col'>
        {count > 0
          ? children
          : loading && (
              <li className='flex animate-arrive items-center gap-3 px-3 py-3 text-sm text-muted'>
                <Spinner />
                {waiting}
              </li>
            )}
      </ul>
    </section>
  );
}
