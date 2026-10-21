import {
  ArrowLeftRight,
  BookCheck,
  BookMarked,
  BookOpen,
  Gift,
  Handshake,
  ScrollText,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { sources, ways } from '@/entities/book/acquired';
import type { CopyDetails } from '@/entities/book/types';
import { daysFromToday } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { dayName, loanLine } from './copyLines';

// One moment in a copy's story: when (if known), what, pictured, and maybe
// a word more beneath, which may need to stand out: a loan due back soon,
// or late
export type Moment = {
  day?: string;
  icon: LucideIcon;
  what: string;
  more?: { text: string; urgency: 'late' | 'soon' | 'calm' };
};

// Each usual way a book comes, pictured
const wayIcons: Record<string, LucideIcon> = {
  bought: ShoppingBag,
  gift: Gift,
  inherited: ScrollText,
  found: Sparkles,
  swapped: ArrowLeftRight,
};

// How it came: "A gift from Mum", "Bought at a little shop"
function cameMoment(acquired: CopyDetails['acquired']): Moment | null {
  const { how, from, date } = acquired ?? {};
  if (!how && !date) return null;
  const way = ways.find((w) => w.value === how);
  const source = how ? sources[how] : undefined;
  return {
    day: date,
    icon: (how && wayIcons[how]) || BookMarked,
    what: [
      way?.label ?? how ?? 'Came to you',
      source && from && `${source.joiner} ${from}`,
    ]
      .filter(Boolean)
      .join(' '),
  };
}

// Out on loan, with how long until it's due back
function loanMoment(copy: CopyDetails): Moment | null {
  if (copy.status === 'shelf') return null;
  const left = copy.due ? daysFromToday(copy.due) : null;
  const due =
    left === null
      ? null
      : left < 0
        ? `${counted(-left, 'day')} late`
        : left === 0
          ? 'Due back today'
          : `Due back in ${counted(left, 'day')}`;
  return {
    day: copy.since,
    icon: Handshake,
    what: loanLine(copy)!,
    more: due
      ? {
          text: `${due} · ${dayName(copy.due)}`,
          urgency: left! < 0 ? 'late' : left! <= 3 ? 'soon' : 'calm',
        }
      : undefined,
  };
}

// The story of this copy, the latest first: whether it's out on loan, when
// it was read, how it came to the reader. What has no date goes where it
// most likely belongs: a loan latest, how it came earliest.
export function copyStory(copy: CopyDetails | undefined): Moment[] {
  if (!copy) return [];
  const came = cameMoment(copy.acquired);
  const loan = loanMoment(copy);
  const dated: Moment[] = [
    ...(copy.started
      ? [{ day: copy.started, icon: BookOpen, what: 'Started reading' }]
      : []),
    ...(copy.reading === 'read' && copy.finished
      ? [{ day: copy.finished, icon: BookCheck, what: 'Finished reading' }]
      : []),
  ];
  if (came?.day) dated.push(came);
  if (loan?.day) dated.push(loan);
  dated.sort((a, b) => a.day!.localeCompare(b.day!));
  // Newest first
  return [
    ...(loan && !loan.day ? [loan] : []),
    ...dated.reverse(),
    ...(came && !came.day ? [came] : []),
  ];
}
