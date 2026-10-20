import { cn } from '@/shared/lib/cn';

// The line under a field: its error, or else a quiet hint
export function FieldNote({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: string;
}) {
  const note = error ?? hint;
  if (!note) return null;
  return (
    <p id={id} className={cn('text-xs', error ? 'text-danger' : 'text-faint')}>
      {note}
    </p>
  );
}
