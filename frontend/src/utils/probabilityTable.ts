import { ProbabilityTable, Relatives } from '../services/type';

export const getWinRate = (
  probabilityTable: ProbabilityTable,
  poolSize: number,
  jkptPrice: number
) => {
  const { rewards } = probabilityTable;
  const winRate = rewards.reduce((acc, r) => {
    const { type, reward, expect } = r;
    const rate =
      type === Relatives.Input
        ? expect / reward
        : expect / (poolSize * reward * jkptPrice);
    return acc + rate;
  }, 0);
  return winRate;
};

export const getJackpot = (
  probabilityTable: ProbabilityTable,
  poolSize: number,
  jkptPrice: number
) => {
  const { rewards } = probabilityTable;
  const relativeRewards = rewards
    .filter((r) => r.type === Relatives.Pool)
    .sort((a, b) => b.reward - a.reward);
  const fixedRewards = rewards
    .filter((r) => r.type === Relatives.Input)
    .sort((a, b) => b.reward - a.reward);

  if (relativeRewards.length === 0) {
    return fixedRewards[0].reward / 1e6;
  }

  if (fixedRewards.length === 0) {
    return (relativeRewards[0].reward * poolSize) / 1e6;
  }

  return (
    Math.max(
      (relativeRewards[0].reward * poolSize * jkptPrice) / 1e6,
      fixedRewards[0].reward / 1e6
    ) / jkptPrice
  );
};

export const getPayoutRatio = (probabilityTable: ProbabilityTable) => {
  const { rewards } = probabilityTable;
  const payoutRatio = rewards.reduce((acc, r) => {
    return acc + r.expect;
  }, 0);
  return payoutRatio / 1e6;
};
