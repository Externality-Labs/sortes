import { ProbabilityTable, Relatives } from '../services/type';

export enum RewardUnits {
  JKPT = 'JKPT',
  XEXP = 'EXP',
  GOOD = 'GOOD',
}

export interface Reward {
  level: number;
  unit: RewardUnits;
  value: number;
  multiplier: number;
}

export const enum PlayCurrency {
  USDT = 0,
  USDC = 1,
}

// if reward wbtc value < ShowSatoshiThreshold, show as satoshi
export const ShowSatoshiThreshold = 0.001;

export const formatWbtcValue = (
  value: number,
  withUnit: boolean = false
): string => {
  if (value < ShowSatoshiThreshold) {
    return (value * 1e8).toFixed(0) + (withUnit ? ' Satoshi' : '');
  } else {
    return value.toFixed(4) + (withUnit ? ' WBTC' : '');
  }
};

interface ParaseRewardParams {
  inputAmount: number;
  outputAmount: number;
  outputTokenPrice: number;
  levels: string[];
  table: ProbabilityTable;
  outputXexpAmount: number;
  goodsAmount?: number;
}

export const parseReward = ({
  inputAmount,
  outputAmount,
  outputTokenPrice,
  levels,
  table,
  outputXexpAmount,
  goodsAmount,
}: ParaseRewardParams): Reward[] => {
  const ticketUsdValue = inputAmount;
  const { rewards } = table;
  const levelsNum = levels.map((l) => parseInt(l));
  const ratio = 1;
  const isSpdPlay = goodsAmount !== undefined;

  // 最后一位表示 EXP
  const levelsNotExp = levelsNum.filter((l) => l !== rewards.length);

  const fixedPrizesTotal = levelsNotExp
    .filter((l) => rewards[l].type === Relatives.Input)
    .reduce(
      (total, cur) => total + rewards[cur].reward / 1e6 / outputTokenPrice,
      0
    );

  const relativePrizesTotal = outputAmount - fixedPrizesTotal;
  const relativePrizesAmountTotal = levelsNotExp
    .filter((l) => rewards[l].type === Relatives.Pool)
    .reduce((total, cur) => total + rewards[cur].reward, 0);

  const results = levels
    .map((l) => parseInt(l))
    .map((level) => {
      if (level === rewards.length)
        return {
          unit: isSpdPlay ? RewardUnits.GOOD : RewardUnits.XEXP,
          value: isSpdPlay ? goodsAmount! : outputXexpAmount / levels.length,
          level,
          multiplier: 0,
        };
      else {
        const rewardItem = rewards[level];
        if (rewardItem.type === Relatives.Input) {
          const rewardUsdValue =
            (rewards[level].reward * ticketUsdValue * ratio) / 1e6;
          return {
            unit: RewardUnits.JKPT,
            value: rewardUsdValue / outputTokenPrice,
            level,
            multiplier: Math.floor(rewardUsdValue / ticketUsdValue),
          };
        } else if (rewardItem.type === Relatives.Pool) {
          const rewardJkptValue =
            ((rewards[level].reward * ratio) / relativePrizesAmountTotal) *
            relativePrizesTotal;
          return {
            unit: RewardUnits.JKPT,
            value: rewardJkptValue,
            level,
            multiplier: Math.floor(rewardJkptValue / outputTokenPrice),
          };
        }
        throw new Error('Unknown reward level');
      }
    });
  return results as Reward[];
};
