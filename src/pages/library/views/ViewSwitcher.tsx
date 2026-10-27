import { Columns3, LayoutGrid, List, Rows3, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { kindOf, type BookView, type ViewKind } from './views';

// `wide`: only offered where there's room for it to look any different
type Option = {
  value: BookView;
  label: string;
  icon: ReactNode;
  wide?: boolean;
};

const kinds: { value: ViewKind; label: string; icon: ReactNode }[] = [
  { value: 'universe', label: 'Universe', icon: <Sparkles size={15} /> },
  { value: 'grid', label: 'Grid', icon: <LayoutGrid size={15} /> },
  { value: 'list', label: 'List', icon: <List size={16} /> },
];

const gridSizes: Option[] = [
  { value: 'grid-s', label: 'Small covers', icon: 'S' },
  // Two to a row on a phone, as large covers are
  { value: 'grid-m', label: 'Medium covers', icon: 'M', wide: true },
  { value: 'grid-l', label: 'Large covers', icon: 'L' },
];

const listLayouts: Option[] = [
  { value: 'list', label: 'One column', icon: <Rows3 size={15} /> },
  { value: 'list-columns', label: 'Columns', icon: <Columns3 size={15} /> },
];

// Universe, grid or list; the grid comes in three sizes (two on a phone),
// the list in one column or several
export function ViewSwitcher({
  view,
  onChange,
  onChangeKind,
}: {
  view: BookView;
  onChange: (view: BookView) => void;
  onChangeKind: (kind: ViewKind) => void;
}) {
  const kind = kindOf(view);
  // Medium covers look just like large ones on a phone, so they're shown
  // as large there
  const phone = useMediaQuery('(max-width: 639px)');
  const size = phone && view === 'grid-m' ? 'grid-l' : view;
  return (
    <div className='flex items-center gap-2'>
      {kind === 'grid' && (
        <ChoiceCapsule
          label='Cover size'
          options={gridSizes}
          // S, M and L say it already
          tips={false}
          current={size}
          onChange={onChange}
        />
      )}
      {kind === 'list' && (
        <ChoiceCapsule
          label='List layout'
          options={listLayouts}
          // Phones only ever fit one column, so there's nothing to choose
          className='hidden md:flex'
          current={view}
          onChange={onChange}
        />
      )}
      <ChoiceCapsule
        label='View'
        options={kinds}
        current={kind}
        onChange={onChangeKind}
      />
    </div>
  );
}
