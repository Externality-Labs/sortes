import { BigNumber } from 'ethers';

export interface CreateSwapParams {
  name: string;
  relatives: Relatives[];
  expectations: number[];
  rewards: number[];
  millionthRatio: number;
}
export interface RewardItem {
  expectation: string;
  type: Relatives;
  amount: string;
}

export interface PlayParams {
  inputToken: string;
  inputAmount: BigNumber;
  repeats: BigNumber;
  outputToken: string;
  table: {
    relatives: BigNumber[];
    mExpectations: BigNumber[];
    mRewards: BigNumber[];
    tag: BigNumber;
  };
}

export interface DonationPlayParams extends PlayParams {
  donationId: BigNumber;
}

export interface PlayWithVoucherParams {
  voucherId: BigNumber;
  outputToken: string;
  table: {
    relatives: BigNumber[];
    mExpectations: BigNumber[];
    mRewards: BigNumber[];
    tag: BigNumber;
  };
}

export interface DonationPlayWithVoucherParams extends PlayWithVoucherParams {
  donationId: BigNumber;
}

export interface ShootParams {
  inputToken: string;
  inputAmount: BigNumber;
  repeats: BigNumber;
  outputToken: string;
  outputAmount: BigNumber;
}

export interface PlayStatus {
  fulfilled: boolean;
  id: BigNumber;
  blockNumber: BigNumber;
  player: string;
  tableId: BigNumber;
  inputToken: string;
  inputAmount: BigNumber;
  outputToken: string;
  repeats: BigNumber;
  requestId: BigNumber;
  randomWord: BigNumber;
  outcomeLevels: BigNumber[];
  outputTotalAmount: BigNumber;
  outputXexpAmount: BigNumber;
}

export const enum Relatives {
  Pool = '0',
  Input = '1',
}

export interface ShootStatus {
  fulfilled: boolean;
  id: BigNumber;
  blockNumber: BigNumber;
  player: string;
  inputToken: string;
  inputAmount: BigNumber;
  outputToken: string;
  outputAmount: BigNumber;
  repeats: BigNumber;
  requestId: BigNumber;
  mProbability: BigNumber;
  randomWord: BigNumber;
  results: boolean[];
  outputTotalAmount: BigNumber;
  outputXexpAmount: BigNumber;
}

export interface ProbabilityTableReward {
  type: Relatives;
  expect: number;
  reward: number;
}

export interface ProbabilityTable {
  id: string;
  name: string;
  outputToken: string;
  image: string;
  rewards: ProbabilityTableReward[];
}

export interface SwapDetail {
  id: string;
  rewardItems: RewardItem[];
  name: string;
  owner: string;
  shareRatio: number;
}
export const recipientCategoryOptions = [
  'All',
  'Disaster',
  'Poverty',
  'Health',
  'Education',
  'Society',
  'Justice',
  'Animals',
  'Nature',
  'Tech',
  'Other',
];
