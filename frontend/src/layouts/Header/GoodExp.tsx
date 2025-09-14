import React from 'react';
import TrapezoidRedSvg from '../../assets/svg/mobile/trapezoid-red.svg';
import TrapezoidGreenSvg from '../../assets/svg/mobile/trapezoid-green.svg';
import { useCurrentUser } from '../../hooks/user';

import { useGoodBalance, useXexpBalance } from '../../hooks/balance';
import { formatExpBalance, formatGoodBalance } from '../../utils/format';

interface GoodExpProps {}

const GoodExp: React.FC<GoodExpProps> = () => {
  const { goodBalance } = useGoodBalance();
  const exp = useXexpBalance();
  const { address } = useCurrentUser();
  if (!address) return null;
  return (
    <section className="relative mb-2 flex h-[60px] w-[260px]">
      <div className="absolute left-0 top-0">
        <img src={TrapezoidRedSvg} alt="" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-nowrap text-sm text-blue-600">
          {formatGoodBalance(goodBalance)} GOOD
        </div>
      </div>
      <div className="absolute right-0 top-0">
        <img src={TrapezoidGreenSvg} alt="" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-nowrap text-sm text-blue-600">
          {' '}
          {formatExpBalance(exp.xexpBalance)} EXP
        </div>
      </div>
    </section>
  );
};

export default GoodExp;
