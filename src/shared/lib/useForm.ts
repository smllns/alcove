import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { ApiError } from '@/shared/api/http';

type Status = 'idle' | 'saving' | 'saved';

type FormOptions<Values> = {
  // Fields to empty after a successful submit, e.g. passwords
  clearOnSuccess?: (keyof Values)[];
  // When this changes, old errors are dropped (e.g. the form switched mode)
  resetErrorsOn?: unknown;
};

// State for a small form that talks to the API: values, per-field errors from
// the server, a general error, and a brief "saved" moment after success.
export function useForm<Values extends Record<string, string>>(
  initial: Values,
  submit: (values: Values) => Promise<unknown>,
  { clearOnSuccess = [], resetErrorsOn }: FormOptions<Values> = {},
) {
  const [values, setValues] = useState(initial);
  // Keyed by field name; may also hold keys for things outside `values`
  // (e.g. `links.0` for an item in a list the form keeps elsewhere)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const savedTimer = useRef<number | undefined>(undefined);

  // Adjusted during render, the React way to react to a changed input
  const [errorsFor, setErrorsFor] = useState(resetErrorsOn);
  if (errorsFor !== resetErrorsOn) {
    setErrorsFor(resetErrorsOn);
    setFieldErrors({});
    setFormError(null);
  }

  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  const clearError = (key: string) =>
    setFieldErrors((errors) => {
      if (!(key in errors)) return errors;
      const rest = { ...errors };
      delete rest[key];
      return rest;
    });

  // Errors about a whole list, e.g. after an item is removed and the rest
  // move up a place, so their errors no longer line up
  const clearErrorsUnder = (prefix: string) =>
    setFieldErrors((errors) =>
      Object.fromEntries(
        Object.entries(errors).filter(([key]) => !key.startsWith(prefix)),
      ),
    );

  // For fields that aren't typed into, like a row of choices
  const setValue = <K extends keyof Values>(name: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [name]: value }));

  const change = (name: keyof Values & string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    clearError(name);
    setStatus((s) => (s === 'saved' ? 'idle' : s));
  };

  // Props for one input: value, onChange, and its error cleared as you type
  const field = (name: keyof Values & string) => ({
    name,
    value: values[name],
    error: fieldErrors[name],
    onChange: (e: { target: { value: string } }) =>
      change(name, e.target.value),
  });

  // The same for a field that hands over its value directly (a calendar,
  // a menu) rather than through an input's change event
  const choice = (name: keyof Values & string) => ({
    value: values[name],
    error: fieldErrors[name],
    onChange: (value: string) => change(name, value),
  });

  const onSubmit = async (e?: SubmitEvent) => {
    e?.preventDefault();
    window.clearTimeout(savedTimer.current);
    setStatus('saving');
    setFormError(null);
    try {
      await submit(values);
      setFieldErrors({});
      if (clearOnSuccess.length) {
        setValues((v) => ({
          ...v,
          ...Object.fromEntries(clearOnSuccess.map((k) => [k, ''])),
        }));
      }
      setStatus('saved');
      savedTimer.current = window.setTimeout(() => setStatus('idle'), 2400);
      return true;
    } catch (err) {
      const error = err instanceof ApiError ? err : null;
      const fields = error?.fields ?? {};
      setFieldErrors(fields);
      // Field problems speak for themselves; anything else gets its own line
      if (!Object.keys(fields).length)
        setFormError(error?.message ?? 'Something went wrong.');
      setStatus('idle');
      return false;
    }
  };

  return {
    values,
    setValues,
    setValue,
    field,
    choice,
    errors: fieldErrors,
    setErrors: setFieldErrors,
    clearError,
    clearErrorsUnder,
    onSubmit,
    formError,
    status,
  };
}
