import { useCallback } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router';
import { runCurtain } from './curtain';
import { putKeyboardAway } from './keyboard';
import {
  usesCurtain,
  setPageTransition,
  type PageTransition,
} from './pageTransition';

// navigate(), animated with one of the page transitions
export function useTransitionNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (
      to: To,
      transition: PageTransition = 'forward',
      options?: NavigateOptions,
    ) => {
      if (usesCurtain(transition))
        return runCurtain(() => navigate(to, options));
      // The keyboard down first: going down mid-change, it would cut the
      // animation short
      return putKeyboardAway().then(() => {
        setPageTransition(transition);
        return navigate(to, { ...options, viewTransition: true });
      });
    },
    [navigate],
  );
}
