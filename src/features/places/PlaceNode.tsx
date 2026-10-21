import { counted } from '@/shared/lib/plural';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { labelClass, smallInputText } from '@/shared/ui/fieldStyles';
import { AddButton, RemoveButton } from '@/shared/ui/ListControls';
import { errorKey, levels, type EditNode } from './tree';
import type { PlaceOps } from './usePlacesDraft';
import { FormError } from '@/shared/ui/FormError';

// The level's name, in a column of its own so the names line up
const levelClass = cn('w-[4.5rem] shrink-0', labelClass);

// One place and everything inside it
export function PlaceNode({
  node,
  path,
  ops,
}: {
  node: EditNode;
  path: number[];
  ops: PlaceOps;
}) {
  const depth = path.length - 1;
  const level = levels[depth];
  const inner = levels[depth + 1];
  const children = node.children ?? [];
  const isHome = depth === 0;
  const holdsShelves = depth === 2;

  return (
    <Collapse open={!node.leaving} appear={node.id.startsWith('new-')}>
      <div
        className={cn(
          isHome
            ? 'mb-4 rounded-2xl border border-line bg-surface/50 p-4 sm:p-5'
            : 'pt-3',
        )}
      >
        <NameRow
          node={node}
          path={path}
          ops={ops}
          label={level.label}
          placeholder={level.placeholder}
          big={isHome}
        />

        {inner && (
          <div
            className={cn(
              'mt-1 ml-2 border-l border-line pl-4 sm:pl-5',
              holdsShelves && 'pt-3',
            )}
          >
            {holdsShelves ? (
              <Shelves unit={node} path={path} ops={ops} />
            ) : (
              <>
                {children.map((child, i) => (
                  <PlaceNode
                    key={child.id}
                    node={child}
                    path={[...path, i]}
                    ops={ops}
                  />
                ))}
                <AddButton onClick={() => ops.add(path)} className='mt-2'>
                  Add {inner.add}
                </AddButton>
              </>
            )}
          </div>
        )}
      </div>
    </Collapse>
  );
}

function NameRow({
  node,
  path,
  ops,
  label,
  placeholder,
  big = false,
}: {
  node: EditNode;
  path: number[];
  ops: PlaceOps;
  label: string;
  placeholder: string;
  big?: boolean;
}) {
  const count = ops.counts[node.id];
  const error = ops.errors[errorKey(path)];
  return (
    <div>
      <div className='flex items-center gap-3'>
        <span className={levelClass}>{label}</span>
        <input
          value={node.name}
          onChange={(e) => ops.rename(path, e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          // A new place is there to be named
          autoFocus={node.id.startsWith('new-') && !node.name}
          className={cn(
            'min-w-0 flex-1 border-b bg-transparent py-1.5 text-ink outline-none transition-colors duration-500 ease-soft placeholder:text-faint focus:border-ink',
            big ? 'font-serif text-xl tracking-[-0.01em]' : 'text-base',
            error ? 'border-danger' : 'border-line',
          )}
        />
        {count ? (
          <span className='shrink-0 text-xs text-faint'>
            {counted(count, 'book')}
          </span>
        ) : null}
        <RemoveButton
          onClick={() => ops.remove(path, node.id)}
          label={`Remove ${label.toLowerCase()}`}
        />
      </div>
      <FormError message={error} small className='mt-1 pl-21' />
    </div>
  );
}

// A bookcase's shelves, side by side as small named chips
function Shelves({
  unit,
  path,
  ops,
}: {
  unit: EditNode;
  path: number[];
  ops: PlaceOps;
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className={levelClass}>Shelves</span>
      {(unit.children ?? []).map((shelf, i) => {
        const shelfPath = [...path, i];
        const error = ops.errors[errorKey(shelfPath)];
        return (
          <span
            key={shelf.id}
            className={cn(
              'flex animate-rise items-center rounded-full border bg-surface/70 pl-3 transition-opacity duration-500 ease-soft',
              shelf.leaving && 'pointer-events-none opacity-0',
              error ? 'border-danger' : 'border-line',
            )}
          >
            <input
              value={shelf.name}
              onChange={(e) => ops.rename(shelfPath, e.target.value)}
              placeholder={levels[3].placeholder}
              aria-label='Shelf'
              title={error}
              autoFocus={shelf.id.startsWith('new-') && !shelf.name}
              size={Math.max(shelf.name.length, 2)}
              className={cn(
                'bg-transparent py-1 text-ink outline-none placeholder:text-faint',
                smallInputText,
              )}
            />
            <RemoveButton
              onClick={() => ops.remove(shelfPath, shelf.id)}
              label='Remove shelf'
            />
          </span>
        );
      })}
      <AddButton onClick={() => ops.add(path)}>Add a shelf</AddButton>
    </div>
  );
}
