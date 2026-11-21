import { useEffect, useState } from 'react';

export const useIsTabActive = (): boolean => {
  const [isActive, setIsActive] = useState<boolean>(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onChange = () => setIsActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return isActive;
};