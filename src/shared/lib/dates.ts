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

// "25 Dec"
export const dayMonth = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const monthName = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

// A month by its number in the year, January being 0: "March"
export const monthOfYear = (month: number) =>
  new Date(2000, month).toLocaleDateString('en-GB', { month: 'long' });

export const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// The months by their first letters, January first, as a chart's axis
// writes them
export const monthLetters = 'JFMAMJJASOND'.split('');

export const DAY_MS = 24 * 60 * 60 * 1000;

// Days from today to `day`: 0 for today, below 0 for a day gone by; null
// for something that isn't a day
export function daysFromToday(day: string) {
  const date = fromDay(day);
  const now = fromDay(today());
  return date && now ? Math.round((+date - +now) / DAY_MS) : null;
}

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

// A year as typed: in full, or by its last two figures, taken as this
// century's unless that's still to come
function fullYear(typed: string) {
  const year = Number(typed);
  if (typed.length !== 2) return year;
  const now = new Date().getFullYear();
  return year + 2000 > now ? year + 1900 : year + 2000;
}

// A day as someone types it, the day before the month as in Britain:
// "25 December 2019", "25 Dec 19", "December 25, 2019", "25/12/2019",
// "25.12.19", or as stored, "2019-12-25". Null for anything else, or a day
// no calendar has (the 31st of April).
export function parseDay(text: string) {
  const typed = text
    .trim()
    .toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/, '$1');
  const monthOf = (name: string) => MONTHS.indexOf(name.slice(0, 3)) + 1;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(typed);
  const figures = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{2}|\d{4})$/.exec(
    typed,
  );
  const dayFirst = /^(\d{1,2})\s+([a-z]{3,})\.?,?\s+(\d{2}|\d{4})$/.exec(typed);
  const monthFirst = /^([a-z]{3,})\.?\s+(\d{1,2}),?\s+(\d{2}|\d{4})$/.exec(
    typed,
  );
  // Day, month, year, each as typed
  const parts: [string, string | number, string] | null = iso
    ? [iso[3], iso[2], iso[1]]
    : figures
      ? [figures[1], figures[2], figures[3]]
      : dayFirst
        ? [dayFirst[1], monthOf(dayFirst[2]), dayFirst[3]]
        : monthFirst
          ? [monthFirst[2], monthOf(monthFirst[1]), monthFirst[3]]
          : null;
  if (!parts) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const date = new Date(fullYear(parts[2]), month, day);
  // A day no calendar has rolls over into the next month
  if (date.getMonth() !== month || date.getDate() !== day) return null;
  return toDay(date);
}
