import { Link, type LinkProps } from 'react-router';
import { keyboardUp } from '@/shared/lib/keyboard';
import { isPlainClick } from '@/shared/lib/plainClick';
import {
  setPageTransition,
  usesCurtain,
  type PageTransition,
} from '@/shared/lib/pageTransition';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';

type TransitionLinkProps = LinkProps & { transition?: PageTransition };

// A router link that animates the page change. Still a real link, so
// cmd/ctrl-click and middle-click open a new tab as usual.
export function TransitionLink({
  transition = 'forward',
  onClick,
  to,
  replace,
  ...props
}: TransitionLinkProps) {
  const navigate = useTransitionNavigate();
  const curtain = usesCurtain(transition);

  return (
    <Link
      to={to}
      replace={replace}
      viewTransition={!curtain}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (!isPlainClick(e)) return;
        // Left to the link itself, unless the keyboard needs putting away
        // first or the curtain drawn (useTransitionNavigate)
        if (!curtain && !keyboardUp()) {
          setPageTransition(transition);
          return;
        }
        e.preventDefault();
        navigate(to, transition, { replace });
      }}
      {...props}
    />
  );
}
