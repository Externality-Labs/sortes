import { Popup, PopupProps } from '../../../components/Modal/Popup';
import { Reward, RewardUnits } from '../../../utils/reward';
import DetailCard from './DetailCard';

const MobileCardListPopup: React.FC<{ rewards: Reward[] } & PopupProps> = ({
  rewards,
  visible,
  setVisible,
}) => {
  const sortedRewards = rewards.sort((r1, r2) => {
    if (r1.unit === RewardUnits.XEXP) return 1;
    if (r2.unit === RewardUnits.XEXP) return -1;
    return r2.level - r1.level;
  });

  if (!rewards.length || rewards.length === 1) return null;
  return (
    <Popup visible={visible} clickModalClosable={false} setVisible={setVisible}>
      <div className="relative rounded-2xl bg-[#F5F5F5] text-base font-bold">
        <span
          onClick={() => setVisible(false)}
          className="absolute right-4 top-2 cursor-pointer"
        >
          <i className="iconfont icon-close-outlined text-2xl text-text1" />
        </span>
        <div className="mt-12 max-h-[500px] overflow-y-auto p-4 pt-0">
          <ul className="flex flex-col gap-2.5">
            {sortedRewards.map((reward, idx) => (
              <DetailCard key={idx} reward={reward} idx={idx} />
            ))}
          </ul>
        </div>
      </div>
    </Popup>
  );
};

export default MobileCardListPopup;
