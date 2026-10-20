import { useState } from 'react';
import { easeChange } from '@/shared/lib/easeChange';
import { readStored, store } from '@/shared/lib/storage';
import {
  fades,
  orders,
  usual,
  type Arrangement,
  type ShelfFade,
  type ShelfOrder,
} from './order';

const KEY = 'alcove.books-order';

// What's stored: "title none reversed"; anything unknown falls back

function read(): Arrangement {
  const saved = (readStored(KEY) ?? '').split(' ');
  return {
    order: orders.some((o) => o.value === saved[0])
      ? (saved[0] as ShelfOrder)
      : usual.order,
    reversed: saved[2] === 'reversed',
    fade: fades.some((f) => f.value === saved[1])
      ? (saved[1] as ShelfFade)
      : usual.fade,
  };
}

// The chosen order and fade, remembered in this browser. A new order, or
// the same one turned round, glides each book over to its new place.
export function useShelfOrder() {
  const [choice, setArrangement] = useState(read);
  const save = (next: Arrangement) => {
    store(
      KEY,
      `${next.order} ${next.fade} ${next.reversed ? 'reversed' : 'usual'}`,
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
  };
}
