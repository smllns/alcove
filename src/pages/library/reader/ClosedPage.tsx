import { Lock } from 'lucide-react';
import type { ReaderPage } from '@/entities/reader/types';
import { callName } from '@/entities/user/types';

// In place of a page opened only to those its reader lets in, as photo
// apps show one: a large lock in a ring, that it's closed, and what opens
// it (following, or, asked already, their yes)
export function ClosedPage({ page }: { page: ReaderPage }) {
  const them = callName(page);
  return (
    <div className='flex animate-rise flex-col items-center py-12 text-center sm:py-20'>
      <span className='grid size-24 place-items-center rounded-full border-2 border-ink text-ink sm:size-28'>
        <Lock size={40} strokeWidth={1.4} />
      </span>
      <h2 className='mt-6 font-serif text-2xl tracking-[-0.01em] sm:text-[1.75rem]'>
        This page is closed
      </h2>
      <p className='mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-muted'>
        {page.follow === 'asked'
          ? `You’ve requested to follow ${them}. It opens once they say yes.`
          : `Request to follow ${them} to see their books and lists.`}
      </p>
    </div>
  );
}
