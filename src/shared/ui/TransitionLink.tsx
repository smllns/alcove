import { Link, type LinkProps } from 'react-router';
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
        if (!curtain) {
          setPageTransition(transition);
          return;
        }
        const plainClick =
          e.button === 0 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey;
        if (!plainClick) return;
        e.preventDefault();
        navigate(to, transition, { replace });
      }}
      {...props}
    />
  );
}
