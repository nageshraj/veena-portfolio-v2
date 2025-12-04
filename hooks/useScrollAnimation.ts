// Hook for scroll-based animations with debouncing
import { useEffect, useState, useCallback } from 'react';
import { debounce } from '@/lib/utils';

export const useScrollAnimation = (debounceMs: number = 10) => {
  const [scrollY, setScrollY] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetScrollY = useCallback(
    debounce((value: number) => {
      setScrollY(value);
    }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        debouncedSetScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedSetScrollY]);

  return scrollY;
};
