import { useState } from 'react';
import { Popup } from '../../../components/Modal/Popup';
import { Reward, RewardUnits } from '../../../utils/reward';
import DetailCard from './DetailCard';

// https://f0rn6ydscr.larksuite.com/mindnotes/ELkJb96xYmnQLHn2zXbu3Tfoscd
const ViewMorePopupThreshold = 34;

const CardList: React.FC<{ rewards: Reward[]; jkptName: string }> = ({
  rewards,
  jkptName,
}) => {
  const [detailsPopupVisible, setDetailsPopupVisible] = useState(false);
  const showMore = rewards.length > ViewMorePopupThreshold;
  const listHeightClz = showMore ? 'h-[675px]' : 'h-full';
  const sortedRewards = rewards.sort((r1, r2) => {
    if (r1.unit === RewardUnits.XEXP || r1.unit === RewardUnits.GOOD) return 1;
    if (r2.unit === RewardUnits.XEXP || r2.unit === RewardUnits.GOOD) return -1;
    return r2.level - r1.level;
  });

  if (!rewards.length || rewards.length === 1) return null;
  return (
    <div className="ml-5 text-sm font-normal">
      <ul
        className={`${listHeightClz} relative flex flex-col flex-wrap items-center gap-x-5 gap-y-1.5 max-sm:hidden`}
      >
        {(showMore
          ? sortedRewards.slice(0, ViewMorePopupThreshold - 2)
          : sortedRewards
        ).map((reward, idx) => (
          <DetailCard key={idx} reward={reward} idx={idx} jkptName={jkptName} />
        ))}
      </ul>
      {showMore && (
        <button
          className="w-[400px] rounded-lg bg-[#3370FF] py-2 text-white max-sm:hidden"
          onClick={() => setDetailsPopupVisible(true)}
        >
          Check all the play results
        </button>
      )}
      {detailsPopupVisible && (
        <Popup
          visible={detailsPopupVisible}
          clickModalClosable={false}
          setVisible={setDetailsPopupVisible}
        >
          <div
            className="relative w-[1190px] rounded-2xl"
            style={{
              width:
                sortedRewards.length > 34
                  ? `${Math.ceil(sortedRewards.length / 17) * 200 - 10}px` // fix firefox flex-wrap issue
                  : 'auto',
            }}
          >
            <span
              onClick={() => setDetailsPopupVisible(false)}
              className="absolute -right-20 -top-12 cursor-pointer"
            >
              <i className="iconfont icon-close-outlined text-2xl text-white" />
            </span>
            <ul className="flex h-[772px] flex-col flex-wrap gap-2.5">
              {sortedRewards.map((reward, idx) => (
                <DetailCard
                  key={idx}
                  reward={reward}
                  idx={idx}
                  jkptName={jkptName}
                />
              ))}
            </ul>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default CardList;
