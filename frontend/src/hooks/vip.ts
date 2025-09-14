import { useMemo } from 'react';

import { useXexpBalance } from './balance';

export const useVipInfo = () => {
  const { xexpBalance } = useXexpBalance();

  const vip = useMemo(() => {
    const val = Number(xexpBalance);
    if (val >= 2000 && val <= 4999) {
      return 2;
    } else if (val >= 5000 && val <= 9999) {
      return 3;
    } else if (val >= 10000) {
      return 4;
    } else {
      return 1;
    }
  }, [xexpBalance]);

  const progress = useMemo(() => {
    const val = Number(xexpBalance) || 0;
    if (!val) {
      return '0%';
    }
    if (vip === 4) {
      return '100%';
    }

    if (vip === 1) {
      return `${Math.round((val / 2000) * 100)}%`;
    } else if (vip === 2) {
      return `${Math.round((val / 5000) * 100)}%`;
    } else {
      return `${Math.round((val / 10000) * 100)}%`;
    }
  }, [xexpBalance, vip]);

  return { vip, progress };
};
