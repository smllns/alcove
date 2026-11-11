import { paths } from '@/shared/config/paths';
import { ReaderFrame } from './ReaderFrame';
import { ReaderView } from './ReaderView';

// Another reader's page, opened by their username (ReaderView); the
// reader's own is their profile
export function ReaderPage() {
  return (
    <ReaderFrame own={paths.profile} backBeside>
      {(page) => <ReaderView page={page} back />}
    </ReaderFrame>
  );
}
