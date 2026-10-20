import { useState } from 'react';
import { useSavePlaces } from '@/entities/place/queries';
import type { Home } from '@/entities/place/types';
import { ApiError } from '@/shared/api/http';
import { COLLAPSE_MS } from '@/shared/ui/Collapse';
import {
  addChild,
  blank,
  booksInRemoved,
  errorKey,
  fromHomes,
  idsOf,
  removeId,
  tidy,
  toHomes,
  updateAt,
  type EditNode,
} from './tree';

// What a place in the editor can do to the draft, and what it shows
export type PlaceOps = {
  rename: (path: number[], name: string) => void;
  add: (path: number[]) => void;
  remove: (path: number[], id: string) => void;
  counts: Record<string, number>;
  errors: Record<string, string>;
};

// The editor's working copy of the reader's places, and saving it. Removing
// places that hold books asks first: `moving` is how many would move.
export function usePlacesDraft({
  homes,
  counts,
  startBlank,
  onSaved,
}: {
  homes: Home[];
  counts: Record<string, number>;
  startBlank: boolean;
  onSaved?: () => void;
}) {
  const save = useSavePlaces();
  const saved = fromHomes(homes);
  const [draft, setDraft] = useState(() =>
    startBlank && !homes.length ? [blank()] : saved,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [moving, setMoving] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const changed =
    JSON.stringify(toHomes(tidy(draft))) !== JSON.stringify(toHomes(saved));

  const edit = (update: (nodes: EditNode[]) => EditNode[]) => {
    setDraft(update);
    setMoving(0);
    setJustSaved(false);
  };

  const ops: PlaceOps = {
    counts,
    errors,
    rename: (path, name) => {
      edit((d) => updateAt(d, path, (node) => ({ ...node, name })));
      setErrors((errs) => {
        const rest = { ...errs };
        delete rest[errorKey(path)];
        return rest;
      });
    },
    add: (path) => edit((d) => addChild(d, path, blank())),
    // Folds away first, then goes; later places shift up, so old errors
    // no longer point at the right rows
    remove: (path, id) => {
      edit((d) => updateAt(d, path, (node) => ({ ...node, leaving: true })));
      window.setTimeout(() => setDraft((d) => removeId(d, id)), COLLAPSE_MS);
      setErrors({});
    },
  };

  const submit = (confirmed: boolean) => {
    const tidied = tidy(draft);
    const affected = booksInRemoved(saved, new Set(idsOf(tidied)), counts);
    if (affected && !confirmed) {
      setMoving(affected);
      return;
    }
    setDraft(tidied);
    setMoving(0);
    setFormError(null);
    save.mutate(toHomes(tidied), {
      onSuccess: (result) => {
        setDraft(fromHomes(result.homes));
        setErrors({});
        setJustSaved(true);
        onSaved?.();
      },
      onError: (err) => {
        const fields = err instanceof ApiError ? err.fields : {};
        setErrors(fields);
        if (!Object.keys(fields).length) setFormError(err.message);
      },
    });
  };

  return {
    draft,
    ops,
    submit,
    changed,
    moving,
    justSaved,
    saving: save.isPending,
    error:
      formError ??
      (Object.keys(errors).length ? 'Some places need a name.' : null),
  };
}
