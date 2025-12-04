// Hook for handling window resize events with debouncing
import { useEffect, useState, useCallback } from 'react';
import { debounce } from '@/lib/utils';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowResize = (debounceMs: number = 150) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetWindowSize = useCallback(
    debounce((width: number, height: number) => {
      setWindowSize({ width, height });
    }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    const handleResize = () => {
      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        debouncedSetWindowSize(window.innerWidth, window.innerHeight);
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedSetWindowSize]);

  return windowSize;
};
