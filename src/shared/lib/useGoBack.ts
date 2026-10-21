import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { flyCoverHome } from './coverFlight';
import { setPageTransition } from './pageTransition';

// Back to the page before, as the browser's own back button goes, so it's
// as the reader left it (scrolled as far), with the 'return' transition.
// A page opened directly has nothing before it in the app; then on to
// `fallback`, in place of this one, the same way.
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    // The router numbers its own entries in history, from 0
    const index = (window.history.state as { idx?: number } | null)?.idx;
    if (index) return navigate(-1);
    setPageTransition('return');
    flyCoverHome();
    return navigate(fallback, { replace: true, viewTransition: true });
  }, [navigate, fallback]);
}
