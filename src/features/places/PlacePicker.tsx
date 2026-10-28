import { useState } from 'react';
import { usePlaces, useSavePlaces } from '@/entities/place/queries';
import type { Home } from '@/entities/place/types';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Collapse } from '@/shared/ui/Collapse';
import { labelClass } from '@/shared/ui/fieldStyles';
import { FormError } from '@/shared/ui/FormError';
import { RemoveButton } from '@/shared/ui/ListControls';
import { Select } from '@/shared/ui/Select';
import { TextField } from '@/shared/ui/TextField';
import { addChild, fromHomes, levels, pathTo, toHomes } from './tree';

// A book's place while it's being picked; '' where nothing is chosen
export type PlaceChoice = {
  home: string;
  room: string;
  unit: string;
  shelf: string;
};

const order = ['home', 'room', 'unit', 'shelf'] as const;
type Level = (typeof order)[number];

const NEW = '__new';
const NONE = '__none';
const TEMP_ID = 'new-picked';

// The choices at each level, given what's chosen above it
function optionsAt(homes: Home[], choice: PlaceChoice) {
  const home = homes.find((h) => h.id === choice.home);
  const room = home?.rooms.find((r) => r.id === choice.room);
  const unit = room?.units.find((u) => u.id === choice.unit);
  return {
    home: homes,
    room: home?.rooms ?? [],
    unit: room?.units ?? [],
    shelf: unit?.shelves ?? [],
  };
}

// The tree with one new place added under what's chosen above `level`
function withNewPlace(
  homes: Home[],
  choice: PlaceChoice,
  level: Level,
  name: string,
): Home[] {
  const nodes = fromHomes(homes);
  const above = order.slice(0, order.indexOf(level)).map((l) => choice[l]);
  const place = { id: TEMP_ID, name, children: [] };
  return toHomes(addChild(nodes, pathTo(nodes, above), place));
}

// Where a book lives, picked level by level from the reader's own places,
// with a new one made on the spot when it isn't there yet. Any level can be
// left unset; a lower one only opens once the one above is chosen.
export function PlacePicker({
  value,
  onChange,
}: {
  value: PlaceChoice;
  onChange: (next: PlaceChoice) => void;
}) {
  const places = usePlaces();
  const save = useSavePlaces();
  const homes = places.data?.homes ?? [];
  const options = optionsAt(homes, value);
  const [creating, setCreating] = useState<Level | null>(null);
  const [newName, setNewName] = useState('');

  // Choosing at one level clears the levels below it
  const choose = (level: Level, id: string) => {
    const next = { ...value };
    for (const l of order.slice(order.indexOf(level))) next[l] = '';
    next[level] = id;
    onChange(next);
  };

  const create = async () => {
    if (!creating || !newName.trim()) return;
    const result = await save.mutateAsync(
      withNewPlace(homes, value, creating, newName.trim()),
    );
    const id = result.created[TEMP_ID];
    if (id) choose(creating, id);
    setCreating(null);
    setNewName('');
  };

  const select = (level: Level, index: number) => {
    const above = order[index - 1];
    const open = !above || Boolean(value[above]);
    const { label } = levels[index];
    return (
      // Waiting for the level above: on a wide screen it holds its place in
      // the row, faded out; on a phone, stacked, it folds away instead of
      // leaving a gap
      <div
        inert={!open}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-500 ease-soft',
          open
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0 sm:grid-rows-[1fr]',
        )}
      >
        <div
          className={cn(
            'min-h-0 overflow-hidden',
            index % 2 === 1 && 'max-sm:pt-5',
          )}
        >
          <Select
            label={label}
            value={creating === level ? NEW : value[level]}
            disabled={places.isPending}
            placeholder={places.isPending ? 'Loading…' : 'Not set'}
            options={[
              ...(value[level]
                ? [{ value: NONE, label: 'Not set', muted: true }]
                : []),
              ...options[level].map((node) => ({
                value: node.id,
                label: node.name,
              })),
              {
                value: NEW,
                label: `+ New ${label.toLowerCase()}…`,
                muted: true,
              },
            ]}
            onChange={(picked) => {
              if (picked === NEW) {
                setCreating(level);
                setNewName('');
              } else {
                setCreating(null);
                choose(level, picked === NONE ? '' : picked);
              }
            }}
          />
        </div>
      </div>
    );
  };

  const creatingLabel = creating && levels[order.indexOf(creating)];

  return (
    <fieldset className='flex flex-col'>
      <legend className={cn('mb-4', labelClass)}>Where it lives</legend>
      <div className='grid gap-x-6 sm:grid-cols-2 sm:gap-y-5'>
        {select('home', 0)}
        {select('room', 1)}
      </div>
      <Collapse open={Boolean(value.room)}>
        <div className='grid gap-x-6 pt-5 sm:grid-cols-2 sm:gap-y-5'>
          {select('unit', 2)}
          {select('shelf', 3)}
        </div>
      </Collapse>

      <Collapse open={creating !== null}>
        <div className='flex items-end gap-3 pt-5'>
          <TextField
            className='flex-1'
            label={`New ${creatingLabel?.label.toLowerCase() ?? 'place'}`}
            placeholder={creatingLabel?.placeholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              // Enter adds the place rather than submitting the book
              if (e.key === 'Enter') {
                e.preventDefault();
                void create();
              }
            }}
          />
          <Button
            variant='pill'
            onClick={() => void create()}
            loading={save.isPending}
            disabled={!newName.trim()}
          >
            Add
          </Button>
          <RemoveButton onClick={() => setCreating(null)} label='Cancel' />
        </div>
        <FormError message={save.error?.message ?? null} />
      </Collapse>

      <p className='mt-3 text-xs text-faint'>
        Leave it empty, or go only as far as you like. Rename or rearrange your
        places any time in Settings.
      </p>
    </fieldset>
  );
}
