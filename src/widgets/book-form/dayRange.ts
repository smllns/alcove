import type { DraftForm } from './BookForm';
import type { DraftFields } from './draft';

type DayField = keyof DraftFields & `copy.${string}`;

// The field for the first day of a span (a start, a loan), which clears the
// last day when it's moved past it, so the span never ends before it began
export function startOfSpan(form: DraftForm, start: DayField, end: DayField) {
  const field = form.choice(start);
  return {
    ...field,
    onChange: (day: string) => {
      field.onChange(day);
      const last = form.values[end];
      if (day && last && last < day) form.setValue(end, '');
    },
  };
}
