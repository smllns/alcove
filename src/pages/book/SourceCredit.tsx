import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { textLinkClass } from '@/shared/ui/buttonStyles';

const LICENCE = 'https://creativecommons.org/licenses/by-sa/4.0/';

// Where something on the page comes from (Wikiquote, Wikipedia), credited
// as their licence asks: the source and the licence, each a link
export function SourceCredit({
  source,
  href,
  className,
}: {
  source: string;
  href: string;
  className?: string;
}) {
  return (
    <p className={cn('text-xs text-faint', className)}>
      From <CreditLink href={href}>{source}</CreditLink>, shared under{' '}
      <CreditLink href={LICENCE}>CC BY-SA</CreditLink>.
    </p>
  );
}

// A quiet link out, in a new tab
function CreditLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target='_blank' rel='noreferrer' className={textLinkClass}>
      {children}
    </a>
  );
}
