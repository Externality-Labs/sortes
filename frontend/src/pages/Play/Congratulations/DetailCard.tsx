import {
  Reward,
  RewardUnits,
  ShowSatoshiThreshold,
  formatWbtcValue,
} from '../../../utils/reward';

import RewardIconBTC from '../../../assets/icons/icon-WBTC.png';

import RewardIconExp from '../../../assets/icons/reward-exp.png';
import RewardIconGood from '../../../assets/icons/reward-good.png';
import RewardIconTaikoWhite from '../../../assets/icons/reward-taiko-white.png';
import RewardIconTaikoPink from '../../../assets/icons/reward-taiko-pink.png';
import RewardIconWETH from '../../../assets/icons/icon-WETH.png';
import RewardIconWBNBBlack from '../../../assets/icons/reward-bnb-black.png';
import RewardIconWBNBWhite from '../../../assets/icons/reward-bnb-white.png';
import RewardIconWBNBGolden from '../../../assets/icons/reward-bnb-golden.png';

function getWBTCStylesByReward(value: number) {
  if (value < ShowSatoshiThreshold) {
    return ['bg-[#FFC107]', 'text-[#7B61FF]'];
  } else return ['bg-[#7B61FF]', 'text-white'];
}

interface DetailCardProps {
  jkptName: string;
  reward: Reward;
  idx: number;
}

const WbtcDetailCard: React.FC<DetailCardProps> = ({
  reward: { unit, value },
  idx,
}) => {
  const [bgClz, textClz] = getWBTCStylesByReward(value);
  const showSatoshi = unit === RewardUnits.JKPT && value < ShowSatoshiThreshold;

  return (
    <li
      className={`${bgClz} ${textClz} flex w-[328px] items-center justify-between rounded-lg px-2.5 py-2 sm:w-[190px]`}
    >
      <span className="inline-block w-14 sm:hidden">{idx + 1}.</span>
      <span className="w-36 text-left sm:w-1/2">+{formatWbtcValue(value)}</span>
      <span className="flex flex-1 items-center">
        <img
          className="mr-2.5 h-5 w-5"
          src={RewardIconBTC}
          alt={`reward-icon-${unit}`}
        />
        <span>{showSatoshi ? 'Satoshi' : 'WBTC'}</span>
      </span>
    </li>
  );
};

const TaikoDetailCard: React.FC<DetailCardProps> = ({
  reward: { value, multiplier },
  idx,
}) => {
  const [bgClz, textClz, icon] = (() => {
    if (multiplier < 16) return ['bg-white', 'text-dark5', RewardIconTaikoPink];
    else if (multiplier >= 16 && multiplier < 64)
      return ['bg-[#E81899]', 'text-white', RewardIconTaikoWhite];
    return ['bg-dark5, text-white', RewardIconTaikoPink];
  })();

  return (
    <li
      className={`${bgClz} ${textClz} flex w-[328px] items-center justify-between rounded-lg px-2.5 py-2 sm:w-[190px]`}
    >
      <span className="inline-block w-14 sm:hidden">{idx + 1}.</span>
      <span className="w-36 text-left sm:w-24">+{value.toFixed(4)}</span>
      <span className="flex flex-1 items-center">
        <img className="mr-2.5 h-5 w-5" src={icon} alt="Reward Icon" />
        <span>{'TAIKO'}</span>
      </span>
    </li>
  );
};
const WethDetailCard: React.FC<DetailCardProps> = ({
  reward: { value, multiplier },
  idx,
}) => {
  const [bgClz, textClz, icon] = (() => {
    if (multiplier < 16) return ['bg-white', 'text-dark5', RewardIconWETH];
    else if (multiplier >= 16 && multiplier < 64)
      return ['bg-[#627EEA]', 'text-white', RewardIconWETH];
    return ['bg-[#5C6BC0], text-white', RewardIconWETH];
  })();

  return (
    <li
      className={`${bgClz} ${textClz} flex w-[328px] items-center justify-between rounded-lg px-2.5 py-2 sm:w-[190px]`}
    >
      <span className="inline-block w-14 sm:hidden">{idx + 1}.</span>
      <span className="w-36 text-left sm:w-24">+{value.toFixed(6)}</span>
      <span className="flex flex-1 items-center">
        <img
          className="mr-2.5 h-5 w-5 rounded-full border border-white"
          src={icon}
          alt="Reward Icon"
        />
        <span>{'WETH'}</span>
      </span>
    </li>
  );
};

const WBNBDetailCard: React.FC<DetailCardProps> = ({
  reward: { value, multiplier },
  idx,
}) => {
  const [bgClz, textClz, icon] = (() => {
    if (multiplier < 16) return ['bg-white', 'text-black', RewardIconWBNBBlack];
    else if (multiplier >= 16 && multiplier < 64)
      return ['bg-[#F3BA2F]', 'text-white', RewardIconWBNBWhite];
    return ['bg-#black, text-white', RewardIconWBNBGolden];
  })();

  return (
    <li
      className={`${bgClz} ${textClz} flex w-[328px] items-center justify-between rounded-lg px-2.5 py-2 sm:w-[190px]`}
    >
      <span className="inline-block w-14 sm:hidden">{idx + 1}.</span>
      <span className="w-36 text-left sm:w-24">+{value.toFixed(6)}</span>
      <span className="flex flex-1 items-center">
        <img
          className="mr-2.5 h-5 w-5 rounded-full border border-white"
          src={icon}
          alt="Reward Icon"
        />
        <span>{'WBNB'}</span>
      </span>
    </li>
  );
};

interface VirtualRewardDetailCardProps {
  value: number;
  unit: RewardUnits;
  idx: number;
}

const VirtualRewardDetailCard: React.FC<VirtualRewardDetailCardProps> = ({
  value,
  unit,
  idx,
}) => {
  return (
    <li
      className={`flex w-[328px] items-center justify-between rounded-lg bg-white px-2.5 py-2 text-blue0 sm:w-[190px]`}
    >
      <span className="inline-block w-14 sm:hidden">{idx + 1}.</span>
      <span className="w-36 text-left sm:w-24">+{value.toFixed(2)}</span>
      <span className="flex flex-1 items-center">
        <img
          className="mr-2.5 h-5 w-5 rounded-full border border-white"
          src={unit === RewardUnits.XEXP ? RewardIconExp : RewardIconGood}
          alt="Token Icon"
        />
        <span>{unit.toUpperCase()}</span>
      </span>
    </li>
  );
};

const DetailCard: React.FC<DetailCardProps> = (props) => {
  const { reward, idx } = props;
  if (reward.unit === RewardUnits.XEXP || reward.unit === RewardUnits.GOOD) {
    return (
      <VirtualRewardDetailCard
        value={reward.value}
        unit={reward.unit}
        idx={idx}
      />
    );
  }
  switch (props.jkptName) {
    case 'weth':
      return <WethDetailCard {...props} />;
    case 'wbtc':
      return <WbtcDetailCard {...props} />;
    case 'wbnb':
      return <WBNBDetailCard {...props} />;
    default:
      return <TaikoDetailCard {...props} />;
  }
};

export default DetailCard;
