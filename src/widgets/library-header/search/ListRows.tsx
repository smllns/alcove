import type { ReactNode } from 'react';
import { Library } from 'lucide-react';
import { Row } from './ResultRows';

// A round mark in place of a photo, for things that have none
function Mark({ children }: { children: ReactNode }) {
  return (
    <span className='grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-soft'>
      {children}
    </span>
  );
}

// A list of books: its name, and whose it is or how many books it holds
// (`detail`)
export function ListRow({
  name,
  detail,
  order,
  onOpen,
}: {
  name: string;
  detail: string;
  order: number;
  onOpen: () => void;
}) {
  return (
    <Row onClick={onOpen} hint='Open' order={order}>
      <Mark>
        <Library size={15} />
      </Mark>
      <span className='min-w-0'>
        <span className='block truncate text-sm text-ink'>{name}</span>
        <span className='block truncate text-xs text-muted'>{detail}</span>
      </span>
    </Row>
  );
}
