// Calendar days, as the app stores them: 'YYYY-MM-DD', in local time

const pad = (n: number) => String(n).padStart(2, '0');

export const toDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function fromDay(day: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export const today = () => toDay(new Date());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// The same day of another month, or that month's last day if it's shorter
export function addMonths(date: Date, months: number) {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  return new Date(
    first.getFullYear(),
    first.getMonth(),
    Math.min(date.getDate(), last.getDate()),
  );
}

// The six weeks shown for a month, Monday first, spilling into the months
// either side
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

// "25 December 2019"
export const longDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const monthName = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const DAY_MS = 24 * 60 * 60 * 1000;

// Days from today to `day`: 0 for today, below 0 for a day gone by; null
// for something that isn't a day
export function daysFromToday(day: string) {
  const date = fromDay(day);
  const now = fromDay(today());
  return date && now ? Math.round((+date - +now) / DAY_MS) : null;
}
