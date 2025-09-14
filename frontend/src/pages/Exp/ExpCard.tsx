import { useXexpBalance } from '../../hooks/balance';
import { useVipInfo } from '../../hooks/vip';
import { useCurrentUser } from '../../hooks/user';
import { readableAddr } from '../../utils/format';

import StarSrc from '../../assets/images/star.png';

const ExpCard = () => {
  const { xexpBalance } = useXexpBalance();
  const { avatar, address } = useCurrentUser();
  const { vip, progress } = useVipInfo();

  if (!address) {
    return null;
  }

  return (
    <div className="flex-1 rounded-2xl bg-mainV1 px-10 py-[30px] max-sm:rounded-lg max-sm:p-4">
      <div className="flex items-center text-white">
        <div className="flex flex-1 items-center gap-4">
          <img className="size-[30px] max-sm:size-5" src={avatar} alt="" />
          <span className="text-lg max-sm:text-sm">
            {readableAddr(address)}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xl max-sm:text-sm">
          <img className="mr-[10px] h-4 w-4 max-sm:mr-1" src={StarSrc} alt="" />
          VIP{vip}
        </span>
      </div>
      <div className="mt-10 flex justify-between text-nowrap text-white max-sm:mt-5 max-sm:items-end">
        <span className="text-2xl">{xexpBalance} EXP</span>
        <span className="max-sm:text-xs">Total current holdings</span>
      </div>
      <div className="mt-[50px] text-white max-sm:mt-[30px]">
        <div className="text-sm">
          Your VlP {Math.min(vip + 1, 4)} Progress: {progress}
        </div>
        <div
          className="relative my-[10px] h-2 rounded-[64px] max-sm:h-1"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.60)' }}
        >
          <div
            className="h-2 rounded-[64px] max-sm:h-1"
            style={{ backgroundColor: '#F83', width: progress }}
          />
        </div>
      </div>
      <div
        className="text-xs font-normal leading-[15px] max-sm:text-[8px]"
        style={{ color: 'rgba(255, 255, 255, 0.60)' }}
      >
        The proportion of your current EXP holdings compared to the amount
        required to advance to the next VIP tier.
      </div>
    </div>
  );
};

export default ExpCard;
