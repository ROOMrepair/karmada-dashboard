import { useCacheStore as useStore } from '@ks-console/shared';
import { useEffect, useRef } from 'react';
import { karmadaServiceUrl } from './constants';
import { notify } from '@kubed/components';

export const useWinState = (): [Window | null, any] => {
  const [winCached, setWinCached] = useStore<Window | null | undefined>(
    'karmada_open_window',
    null,
  );
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!winCached || winCached.closed) {
      const win = window.open(karmadaServiceUrl, '_blank');
      if (win) {
        windowRef.current = win;
        setWinCached(win);
        setTimeout(() => {}, 300);
      } else {
        notify.error('Failed to open new window');
      }
    } else {
      windowRef.current = winCached;
      winCached.focus();
    }

    return () => {};
  }, []);

  return [windowRef.current, setWinCached];
};
