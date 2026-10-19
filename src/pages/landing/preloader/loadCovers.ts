import { loadCover } from '@/entities/book/covers';
import { wait } from '@/shared/lib/motion';

// Loads covers into the shared cache, reporting each as it lands. A cover that
// takes longer than `timeout` counts as done; its book falls back to a
// typographic cover.
export function loadCovers(
  covers: string[],
  {
    timeout,
    onEach,
  }: { timeout: number; onEach: (loaded: number, total: number) => void },
) {
  let loaded = 0;
  return Promise.all(
    covers.map((cover) =>
      Promise.race([loadCover(cover), wait(timeout)]).then(() => {
        loaded += 1;
        onEach(loaded, covers.length);
      }),
    ),
  );
}
