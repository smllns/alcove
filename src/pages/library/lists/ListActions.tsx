import { useState } from 'react';
import { Globe, Lock, SquarePen, Trash2 } from 'lucide-react';
import type { BookList } from '@/entities/list/types';
import { useChangeList, useDeleteList } from '@/entities/list/queries';
import { paths } from '@/shared/config/paths';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { Button } from '@/shared/ui/Button';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { ChoiceToggle } from '@/shared/ui/ChoiceToggle';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

// Under a list of the reader's: changing it (`editing`, turned on and off by
// `onEdit`), its name and what's in it at once; letting other readers find it
// and open it (public) or not, which it is now said beside it; or taking it
// away, after asking. The books stay on the shelves whatever's done.
export function ListActions({
  list,
  editing,
  onEdit,
  kept = true,
  onOpen,
}: {
  list: BookList;
  editing: boolean;
  onEdit: (on: boolean) => void;
  // Kept already; one only being begun has nothing to delete
  kept?: boolean;
  // Made public or private, for one being begun: kept to make it with
  onOpen?: (open: boolean) => void;
}) {
  const [asking, setAsking] = useState(false);
  const remove = useDeleteList();
  const change = useChangeList();
  const navigate = useTransitionNavigate();
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap gap-2.5'>
        <ChoiceToggle
          on={editing}
          onChange={onEdit}
          icon={<SquarePen size={14} />}
          label={editing ? 'Done' : 'Edit list'}
        />
        {kept && (
          <Button
            variant='pill'
            onClick={() => setAsking(true)}
            className='hover:border-danger hover:text-danger'
          >
            <Trash2 size={14} />
            Delete list
          </Button>
        )}
      </div>
      {(kept || onOpen) && (
        // Who can see it: the one it is now, chosen
        <div className='flex flex-col items-start gap-2'>
          <ChoiceCapsule
            label='Who can see it'
            options={[
              { value: 'private', label: 'Private', icon: <Lock size={13} /> },
              { value: 'public', label: 'Public', icon: <Globe size={13} /> },
            ]}
            current={list.public ? 'public' : 'private'}
            onChange={(to) =>
              onOpen
                ? onOpen(to === 'public')
                : change.mutate({ id: list.id, public: to === 'public' })
            }
            tips={false}
            words
          />
          <span className='text-xs text-muted'>
            {list.public ? 'Other readers can find it' : 'Only you can see it'}
          </span>
        </div>
      )}
      <ConfirmDialog
        open={asking}
        title={`Delete “${list.name}”?`}
        confirmLabel='Delete list'
        busy={remove.isPending}
        error={remove.error?.message ?? null}
        onCancel={() => setAsking(false)}
        onConfirm={() =>
          remove.mutate(list.id, {
            onSuccess: () => void navigate(paths.lists, 'return'),
          })
        }
      >
        The list goes; its books stay on your shelves, just out of it.
      </ConfirmDialog>
    </div>
  );
}
