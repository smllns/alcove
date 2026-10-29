import { useState } from 'react';
import { useParams } from 'react-router';
import { useBooks } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import { tidyListName } from '@/entities/list/names';
import { useChangeList, useLists } from '@/entities/list/queries';
import { counted } from '@/shared/lib/plural';
import { FormError } from '@/shared/ui/FormError';
import { Loading } from '@/shared/ui/Loading';
import { PageTitle } from '@/shared/ui/PageHeading';
import { useArranging } from '../places/shelf/arranging';
import { ListActions } from './ListActions';
import { ListBooks } from './ListBooks';
import { ListFrame } from './ListFrame';
import { ListLamp } from './ListLamp';
import { ListLookup } from './ListLookup';
import { ListName } from './ListName';
import { isOwn, listedBooks } from './listedBooks';
import { useListChanges } from './useListChanges';
import { useListSearch } from './useListSearch';
import { useBegunBooks, useListBeing } from './useListBeing';

// One of the reader's lists opened: its pile by a measure (how many, how
// many of them on the reader's shelves), and its books' covers beside it,
// each opening its page. One only being begun opens being changed, the
// cursor in the field for books to put in it, and is kept once something's
// done in it (useListBeing).
export function ListPage() {
  const { id = '' } = useParams();
  const lists = useLists();
  const shelf = useShelf(useBooks(), '', true);
  const being = useListBeing(id, lists.data?.lists);
  const { list, begun } = being;
  // With those put in it as it's being begun
  const books = [
    ...listedBooks(list, shelf.all),
    ...being.early.map((each) => each.book),
  ];
  const own = books.filter(isOwn).length;
  // Changing it, its name and what's in it: its books picked, to take
  // out together, and its name typed over
  const editing = useArranging(begun);
  // Its lamp's light the same once it's made as while it was being begun
  const [light] = useState(id);
  // A book in it looked for; changing it shows it whole
  const search = useListSearch(books, (book) => book);
  if (editing.on && search.query) search.setQuery('');
  const changes = useListChanges(list, search.found);
  const { frame, takeOut } = changes;
  const { putIn, putWork } = useBegunBooks(being, changes);
  const rename = useChangeList();
  const renamed = (text: string) => {
    const name = tidyListName(text);
    if (!list || !name || name === list.name) return;
    if (begun) being.make(name);
    else rename.mutate({ id: list.id, name });
  };

  return (
    <ListFrame
      lightKey={light}
      eyebrow='Your list'
      title={
        list && (
          <ListName
            name={list.name}
            editing={editing.on}
            // The cursor's for the books to put in a list just begun
            focus={begun ? false : undefined}
            onRename={renamed}
          />
        )
      }
      actions={
        list && (
          <>
            <ListActions
              list={list}
              editing={editing.on}
              onEdit={editing.turn}
              kept={!begun}
              onOpen={begun ? being.setOpen : undefined}
            />
            <FormError
              message={(being.error ?? rename.error)?.message ?? null}
              small
              className='mt-2'
            />
          </>
        )
      }
      line={
        books.length
          ? `${counted(books.length, 'book')} · ${
              own === books.length ? 'all' : own || 'none'
            } in your library`
          : 'No books in it yet'
      }
      ruler={
        <ListLamp
          books={books}
          marked={isOwn}
          label='in your library'
          tone='var(--gold)'
        />
      }
      search={
        list && (
          <ListLookup
            search={search}
            editing={editing.on}
            books={books}
            shelf={shelf.all}
            onBook={putIn}
            onWork={putWork}
            focus={begun}
          />
        )
      }
      waiting={
        lists.isError ? (
          <FormError
            message={`This list didn’t load. ${lists.error.message}`}
          />
        ) : !lists.data || !shelf.complete ? (
          <Loading />
        ) : !list ? (
          <PageTitle className='animate-rise'>There’s no such list.</PageTitle>
        ) : undefined
      }
    >
      {list && (
        <ListBooks
          books={books}
          shown={search.found}
          asked={search.asked}
          editing={editing}
          frame={frame}
          onTakeOut={takeOut}
        />
      )}
    </ListFrame>
  );
}
