import { useState } from 'react';
import { easeChange } from '@/shared/lib/easeChange';
import { readOwn, storeOwn } from '@/shared/lib/storage';
import {
  fades,
  shelfOrders,
  shows,
  usual,
  type Arrangement,
  type OrderOption,
  type ShelfFade,
  type ShelfOrder,
  type ShelfShow,
} from './order';

const KEY = 'alcove.books-order';

// What's stored: "title none reversed all"; anything unknown falls back

// One of `options` by its stored value, or else `fallback`
const known = <T extends string>(
  options: { value: T }[],
  value: string | undefined,
  fallback: T,
) => options.find((option) => option.value === value)?.value ?? fallback;

function read(key: string, orders: OrderOption[]): Arrangement {
  const saved = (readOwn(key) ?? '').split(' ');
  return {
    order: known(orders, saved[0], usual.order),
    reversed: saved[2] === 'reversed',
    fade: known(fades, saved[1], usual.fade),
    show: known(shows, saved[3], usual.show),
  };
}

// The chosen order, fade and books shown, remembered in this browser. A
// new order, or the same one turned round, glides each book over to its
// new place; other books shown fade in after those before (the grid and
// the list by a page transition; the sky, shown, fades its stars itself,
// as a transition would hold it still meanwhile). Elsewhere (a list,
// say), remembered under a `key` of its own, out of its own `orders`.
export function useShelfOrder(sky: boolean, key = KEY, orders = shelfOrders) {
  const [choice, setArrangement] = useState(() => read(key, orders));
  const save = (next: Arrangement) => {
    storeOwn(
      key,
      `${next.order} ${next.fade} ${next.reversed ? 'reversed' : 'usual'} ${next.show}`,
    );
    return next;
  };
  return {
    arrangement: choice,
    setOrder: (order: ShelfOrder, reversed: boolean) => {
      if (order === choice.order && reversed === choice.reversed) return;
      easeChange(() => setArrangement(save({ ...choice, order, reversed })));
    },
    setFade: (fade: ShelfFade) => setArrangement(save({ ...choice, fade })),
    setShow: (show: ShelfShow) => {
      if (show === choice.show) return;
      const update = () => setArrangement(save({ ...choice, show }));
      if (sky) update();
      else easeChange(update, 'shown');
    },
  };
}
