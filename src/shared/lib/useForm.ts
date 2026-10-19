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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof Values, string>>
  >({});
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

  // Props for one input: value, onChange, and its error cleared as you type
  const field = (name: keyof Values & string) => ({
    name,
    value: values[name],
    error: fieldErrors[name],
    onChange: (e: { target: { value: string } }) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      setFieldErrors((errors) => ({ ...errors, [name]: undefined }));
      setStatus((s) => (s === 'saved' ? 'idle' : s));
    },
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
      setFieldErrors(fields as Partial<Record<keyof Values, string>>);
      // Field problems speak for themselves; anything else gets its own line
      if (!Object.keys(fields).length)
        setFormError(error?.message ?? 'Something went wrong.');
      setStatus('idle');
      return false;
    }
  };

  return { values, setValues, field, onSubmit, formError, status };
}
