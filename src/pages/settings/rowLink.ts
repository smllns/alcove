import { cn } from '@/shared/lib/cn';
import { textLinkClass } from '@/shared/ui/buttonStyles';

// The quiet link that does something in a row of the settings (change it,
// close it) or beside a group's name
export const rowLinkClass = cn('text-sm text-ink-soft', textLinkClass);
