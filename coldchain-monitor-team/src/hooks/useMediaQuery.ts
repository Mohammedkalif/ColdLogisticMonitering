import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query from React. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/** Tailwind `lg` breakpoint — below this the sidebar becomes a drawer. */
export const useIsMobile = (): boolean => useMediaQuery('(max-width: 1023px)');
