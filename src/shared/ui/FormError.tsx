import { cn } from '@/shared/lib/cn';

// Something that went wrong, said plainly in red. Nothing when there's
// nothing to say.
export function FormError({
  message,
  small = false,
  className,
}: {
  message: string | null | undefined;
  // The size of a field's own note, for a problem with one thing
  small?: boolean;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      role='alert'
      className={cn('text-danger', small ? 'text-xs' : 'text-sm', className)}
    >
      {message}
    </p>
  );
}
