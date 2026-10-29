import { cn } from '@/shared/lib/cn';

// The round mark in a cover's corner while books are being picked: hollow,
// and filled once its book is picked
export function PickMark({ picked }: { picked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute bottom-1.5 right-1.5 size-4 rounded-full border-[1.5px] border-white transition-colors duration-300 ease-soft',
        picked ? 'bg-ink shadow-[inset_0_0_0_2.5px_white]' : 'bg-black/25',
      )}
    />
  );
}
