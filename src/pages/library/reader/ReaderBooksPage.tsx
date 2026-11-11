import { paths } from '@/shared/config/paths';
import { ReaderFrame } from './ReaderFrame';
import { ReaderLibrary } from './ReaderLibrary';

// All of another reader's books (ReaderLibrary); the reader's own are
// their library
export function ReaderBooksPage() {
  return (
    <ReaderFrame own={paths.library}>
      {(page) => <ReaderLibrary page={page} />}
    </ReaderFrame>
  );
}
