import axios from 'axios';
import api from './index';
import { chainInfoMap } from '../../utils/env';
import { chainAtom } from '../../atoms/chain';
import { getDefaultStore } from 'jotai';
const store = getDefaultStore();

interface XbitPrice {
  price: number;
  time: number;
}

interface PoolSize {
  poolSize: number;
  time: number;
}

interface BaseTransaction {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  transactionIndex: number;
}

export interface DepositTransaction extends BaseTransaction {
  lpAmount: number;
  tokenAmount: number;
  tokenAddress: string;
  tokenName: string;
  user: string;
}

export interface WithdrawTransaction extends BaseTransaction {
  lpAmount: number;
  tokenAmount: number;
  tokenAddress: string;
  tokenName: string;
  user: string;
}

export interface ClaimHistoryItem extends BaseTransaction {
  player: string;
  inputToken: string;
  inputAmount: number;
  repeats: number;
  outputToken: string;
  tableId: string;
  playId: string;
  requestId: string;
  maintainer: string;
  maintainerAmount: number;
  claimer: string;
  claimerAmount: number;
  donation: string;
  donationAmount: number;
  shareRatio?: number;
  createdAt: string;
}

export interface DistributionTableItem extends BaseTransaction {
  tableId: string;
  owner: string;
}

export interface PlayHistoryItem extends BaseTransaction {
  fulfilled: boolean;
  playId: string;
  requestId: string;
  player: string;
  inputToken: string;
  inputAmount: number;
  outputToken: string;
  repeats: number;
  randomWord: string;
  tableTag: number;
  outcomeLevels: number[];
  outputTotalAmount: number;
  outputXexpAmount: number;
}

interface WinnerItem {
  player: string;
  blockNumber: number;
  blockTimestamp: number;
  xexpAmount: number;
  inputUsdValue: number;
  outputUsdValue: number;
  luckyRatio: number;
}

type PagedResult<T> = Promise<{ data: T[]; total: number }>;

export enum QueryOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const getXbitPrice = async (
  tokenAddress: string,
  lpAddress: string,
  startTs: number,
  endTs?: number
): Promise<XbitPrice[]> => {
  return await api.get('/xbit/prices', {
    params: { tokenAddress, lpAddress, startTs, endTs },
  });
};

export const getPoolSize = async (
  tokenAddress: string,
  startTs: number,
  endTs?: number
): Promise<PoolSize[]> => {
  return await api.get('/xbit/pool-sizes', {
    params: { tokenAddress, startTs, endTs },
  });
};

export const getPlayHistory = async (params: {
  player: string;
  page: number;
  order: QueryOrder;
  orderBy: string;
}): PagedResult<PlayHistoryItem> => {
  return await api.get('/xbit/play-history', {
    params,
  });
};

export const getShootHistory = async (params: {
  player: string;
  page: number;
  order: QueryOrder;
  orderBy: string;
}): PagedResult<any> => {
  return await api.get('/xbit/shoot-history', {
    params,
  });
};

export const getDepositHistory = async (params: {
  player: string;
  page: number;
  order: QueryOrder;
  orderBy: string;
}): PagedResult<DepositTransaction> => {
  return await api.get('/xbit/deposit-history', {
    params,
  });
};

export const getWithdrawHistory = async (params: {
  player: string;
  page: number;
  order: QueryOrder;
  orderBy: string;
}): PagedResult<WithdrawTransaction> => {
  return await api.get('/xbit/withdraw-history', {
    params,
  });
};

export const getWinnerRanking = async (): Promise<WinnerItem[]> => {
  return await api.get('/xbit/winner-ranking');
};

export const getExpRanking = async (): Promise<WinnerItem[]> => {
  return await api.get('/xbit/exp-ranking');
};

export const getLuckyRanking = async (): Promise<WinnerItem[]> => {
  return await api.get('/xbit/lucky-ranking');
};

export const getRecentWinners = async (): Promise<PlayHistoryItem[]> => {
  return await api.get('/xbit/recent-winners');
};

export const faucet = async (
  address: string
): Promise<{ status: string; message: string }> => {
  // return await api.post("/faucet/send", { address });
  const url = chainInfoMap[store.get(chainAtom)].apiEndpoint + 'faucet/send';

  const resp = await axios.post(url, {
    address,
  });
  return resp.data;
};
