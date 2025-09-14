import { Link, useNavigate } from 'react-router-dom';
import { Popup } from '../../../components/Modal/Popup';
import {
  RewardUnits,
  ShowSatoshiThreshold,
  formatWbtcValue,
} from '../../../utils/reward';
import logoX from '../../../assets/images/dropdown/logo-x.svg';
import rewardBgWBTC from '../../../assets/images/rewards/bg-wbtc.svg';
import rewardBgSatoshi from '../../../assets/images/rewards/bg-satoshi.svg';
import rewardBgTaiko from '../../../assets/images/rewards/bg-taiko.svg';
import rewardBgExp from '../../../assets/images/rewards/bg-exp.svg';
import rewardBgWETH from '../../../assets/images/rewards/bg-weth.svg';
import rewardBgWBNB from '../../../assets/images/rewards/bg-wbnb.svg';
import rewardBgGood from '../../../assets/images/rewards/bg-good.svg';

import CardList from './CardList';
import { useAtom } from 'jotai';
import { congratulationAtom } from '../../../atoms/web3';
import { useMemo, useState } from 'react';
import Tooltip from '../../../components/Tooltip';
import { formatTokenAmount, formatUSD } from '../../../utils/format';
import MobileCardListPopup from './MobileCardListPopup';
import { ProbabilityTable } from '../../../services/type';
import { useJkpt } from '../../../hooks/pool';

const configMap = {
  wbtc: {
    bg: rewardBgWBTC,
    rewardText: 'WBTC',
    colorClz: 'text-white',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-warning',
    playAgainBtnClz: 'border-blue0 bg-white text-blue0',
  },
  satoshi: {
    bg: rewardBgSatoshi,
    rewardText: 'Satoshi',
    colorClz: 'text-[#7B61FF]',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-warning',
    playAgainBtnClz: 'border-blue0 bg-white text-blue0',
  },
  taiko: {
    bg: rewardBgTaiko,
    rewardText: 'TAIKO',
    colorClz: 'text-white',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-[#E81899]',
    playAgainBtnClz: 'border-white bg-white text-blue0',
  },
  exp: {
    bg: rewardBgExp,
    rewardText: 'EXP',
    colorClz: 'text-[#5962BA]',
    closeIconClz: 'text-black',
    depositBtnClz: 'bg-warning',
    playAgainBtnClz: 'border-blue0 bg-white text-blue0',
  },
  good: {
    bg: rewardBgGood,
    rewardText: 'GOOD',
    colorClz: 'text-white',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-warning',
    playAgainBtnClz: 'border-blue0 bg-white text-blue0',
  },
  weth: {
    bg: rewardBgWETH,
    rewardText: 'WETH',
    colorClz: 'text-white',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-white text-[#627EEA]',
    playAgainBtnClz: 'border-white bg-[#627EEA] text-white',
  },
  wbnb: {
    bg: rewardBgWBNB,
    rewardText: 'WBNB',
    colorClz: 'text-white',
    closeIconClz: 'text-white',
    depositBtnClz: 'bg-white text-text1',
    playAgainBtnClz: 'border-white bg-white text-text1',
  },
};

interface CongratulationsProps {
  probabilityTable: ProbabilityTable;
}

const Congratulations: React.FC<CongratulationsProps> = ({
  probabilityTable,
}) => {
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [{ rewards, show }, setCongratulation] = useAtom(congratulationAtom);
  const { jkptName, jkptPrice } = useJkpt(probabilityTable.outputToken);

  const navigate = useNavigate();

  const rewardsNotExpOrGood = rewards.filter(
    (r) => r.unit !== RewardUnits.XEXP && r.unit !== RewardUnits.GOOD
  );
  const isSingleReward = rewardsNotExpOrGood.length === 1;
  const isExp =
    rewardsNotExpOrGood.length === 0 &&
    !rewards.some((r) => r.unit === RewardUnits.GOOD);
  const isGood =
    rewardsNotExpOrGood.length === 0 &&
    rewards.some((r) => r.unit === RewardUnits.GOOD);
  const isVirtualReward = isExp || isGood;

  const rewardUnit = isExp
    ? RewardUnits.XEXP
    : isGood
      ? RewardUnits.GOOD
      : RewardUnits.JKPT;

  const totalRewardValue = rewards
    .filter((reward) => reward.unit === rewardUnit)
    .reduce((acc, cur) => acc + cur.value, 0);

  const config = useMemo(() => {
    if (isExp) return configMap.exp;
    if (isGood) return configMap.good;
    switch (jkptName) {
      // case 'taiko':
      //   return configMap.taiko;
      case 'weth':
        return configMap.weth;
      case 'wbnb':
        return configMap.wbnb;
      default:
        return totalRewardValue < ShowSatoshiThreshold
          ? configMap.satoshi
          : configMap.wbtc;
    }
  }, [isExp, isGood, jkptName, totalRewardValue]);

  const {
    bg,
    rewardText,
    colorClz,
    closeIconClz,
    depositBtnClz,
    playAgainBtnClz,
  } = config;

  return (
    <Popup
      visible={show}
      setVisible={(show) => setCongratulation({ rewards, show })}
    >
      <div
        className={`${colorClz} flex max-sm:flex-col max-sm:items-center max-sm:py-6`}
      >
        <div className="relative w-[328px] rounded-2xl pb-4 text-2xl sm:w-[572px] sm:overflow-hidden sm:pb-10">
          <span
            onClick={() => setCongratulation({ rewards, show: false })}
            className="absolute right-2 top-2 z-10 cursor-pointer sm:hidden"
          >
            <i
              className={`iconfont icon-close-outlined text-2xl ${closeIconClz}`}
            />
          </span>
          <span
            onClick={() => setCongratulation({ rewards, show: false })}
            className="absolute right-5 top-5 z-10 cursor-pointer max-sm:hidden"
          >
            <i
              className={`iconfont icon-close-outlined text-4xl ${closeIconClz}`}
            />
          </span>
          <img src={bg} alt="reward-bg" className="absolute -mt-1" />
          <div className="relative mt-[270px] flex flex-col items-center font-bold sm:mt-[320px]">
            <span className="mt-12 text-base max-sm:-mt-20 sm:text-4xl">
              CONGRATULATIONS
            </span>
            <span className="my-2 text-[30px] font-bold leading-none sm:mb-0 sm:mt-10 sm:text-[56px]">
              +
              {!isVirtualReward && jkptName === 'wbtc'
                ? formatWbtcValue(totalRewardValue)
                : formatTokenAmount(totalRewardValue)}
              &nbsp;
              <span
                className={`relative ${!isVirtualReward && 'text-base sm:text-3xl'}`}
              >
                {rewardText}
                {isExp && (
                  <span className="absolute -right-5 -top-2 h-5 w-5">
                    <Tooltip type="info">
                      <span className="fixed z-50 ml-3 w-64 -translate-y-[85px] translate-x-3 rounded-lg bg-dark0 px-3 py-2">
                        EXP is the point reward you'll get through every Play,
                        which may also affect your level in Sortes.
                        <Link
                          to="/exp"
                          target="_blank"
                          className="text-link underline"
                        >
                          Explore its various utility scenarios.
                        </Link>
                      </span>
                    </Tooltip>
                  </span>
                )}
              </span>
            </span>

            <div className="my-2 text-xl font-bold sm:mb-5 sm:mt-[30px] sm:text-2xl">
              {!isVirtualReward && jkptPrice && (
                <>(≈ {formatUSD(totalRewardValue * jkptPrice)})</>
              )}
            </div>

            {isSingleReward ? (
              <div className="my-3.5 sm:hidden"></div>
            ) : (
              <div
                className="mb-3 mt-1 cursor-pointer text-xs font-medium underline sm:hidden"
                onClick={() => setShowMobileDetail(true)}
              >
                Check all the play results
              </div>
            )}

            <div className="flex w-full items-center justify-between px-2.5 text-2xl text-white sm:mt-6 sm:px-4">
              {isExp && (
                <button
                  className={`text-nowrap rounded-2xl ${depositBtnClz} mr-2 flex-1 border-[2px] border-transparent py-4 text-center max-sm:rounded-xl max-sm:text-base max-sm:leading-[19px] sm:mr-4 sm:py-6`}
                  onClick={() =>
                    window.open(
                      'https://externality-labs.gitbook.io/externality-labs-docs/tokenomic/exp-to-token-conversion',
                      '_blank'
                    )
                  }
                >
                  About EXP
                </button>
              )}
              {isGood && (
                <button
                  className={`text-nowrap rounded-2xl ${depositBtnClz} mr-2 flex-1 border-[2px] border-transparent py-4 text-center max-sm:rounded-xl max-sm:text-base max-sm:leading-[19px] sm:mr-4 sm:py-6`}
                  onClick={() => navigate('/token')}
                >
                  Claim GOOD
                </button>
              )}
              {!isVirtualReward && (
                <button
                  className={`text-nowrap rounded-2xl ${depositBtnClz} mr-2 flex-1 border-[2px] border-transparent py-4 text-center max-sm:rounded-xl max-sm:text-base max-sm:leading-[19px] sm:mr-4 sm:py-6`}
                  onClick={() =>
                    navigate(
                      `/pool?deposit=${
                        rewardUnit === RewardUnits.JKPT ? totalRewardValue : 0
                      }`
                    )
                  }
                >
                  Deposit {jkptName.toUpperCase()}
                </button>
              )}
              <button
                className={`${playAgainBtnClz} flex flex-1 items-center justify-center space-x-4 rounded-2xl border-[2px] border-blue0 py-4 text-blue0 max-sm:rounded-xl max-sm:text-base sm:py-6`}
              >
                <Link
                  to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🎉 Only $1 ticket could hit the massive jackpot on #Sortes! 💸Win big, do good – Sortes incentivizes your participation into public good! 🌍 Take your shot at life-changing rewards today: ${window.location.href}`
                  )}`}
                  target="_blank"
                  className="flex h-full w-full items-center justify-center space-x-4 max-sm:space-x-[10px]"
                  onClick={() => setCongratulation({ rewards, show: false })}
                >
                  <img src={logoX} alt="X" className="h-[20px] w-[22px]" />
                  <h1 className="text-2xl max-sm:text-base max-sm:leading-[19px]">
                    Share
                  </h1>
                </Link>
              </button>
            </div>
          </div>
        </div>
        <CardList rewards={rewards} jkptName={jkptName} />
        <MobileCardListPopup
          rewards={rewards}
          visible={showMobileDetail}
          setVisible={setShowMobileDetail}
        />
      </div>
    </Popup>
  );
};

export default Congratulations;
