import { sameListName, tidyListName } from '@/entities/list/names';
import { useCreateList, useLists } from '@/entities/list/queries';

// The lists a book is in (`value`, their ids), each put in or taken out
// (`toggle`), or a new one started with it in (`addNew`): one by that name
// already is the one meant, and simply chosen; the server says the same of
// one this page hasn't heard of yet
export function useListChoice(
  value: string[],
  onChange: (lists: string[]) => void,
) {
  const lists = useLists().data?.lists ?? [];
  const create = useCreateList();
  const chosen = new Set(value);
  return {
    lists,
    chosen,
    // Why a new list wasn't started, if it wasn't
    failed: create.error?.message ?? null,
    toggle: (id: string) =>
      onChange(chosen.has(id) ? value.filter((v) => v !== id) : [...value, id]),
    addNew: async (typed: string) => {
      const name = tidyListName(typed);
      if (!name) return;
      const known = lists.find((list) => sameListName(list.name, name));
      const { id } = known ?? (await create.mutateAsync({ name })).list;
      if (!chosen.has(id)) onChange([...value, id]);
    },
  };
}
