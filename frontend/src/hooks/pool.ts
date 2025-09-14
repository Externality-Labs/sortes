import { useCallback, useEffect, useMemo, useState } from 'react';
import { Web3Service } from '../services/web3';
import { web3ServiceInitedAtom } from '../atoms/web3';
import { useAtomValue } from 'jotai';
import { chainAtom } from '../atoms/chain';
import { priceAtom } from '../atoms/price';
import { ProbabilityTable, Relatives } from '../services/type';
import Token from '../utils/token';
import { Tokens } from '../utils/address';

export interface RewardConfig {
  type: Relatives;
  reward: number;
  expectation: number;
}

export const useXbitPrice = (jkptTokenAddress: string) => {
  const [xbitPrice, setXbitPrice] = useState<number | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);

  const loadPrice = useCallback(async () => {
    if (!isWeb3ServiceInited) return;
    const token = Token.getTokenByAddress(jkptTokenAddress);
    const jkpt = token.name as keyof Tokens;
    const [xbitSupply, poolSize] = await Promise.all([
      Web3Service.service.getSupply(
        Token.getTokenByName(jkpt).getPairsToken()?.name as keyof Tokens
      ),
      Web3Service.service.getBalance(
        jkpt,
        Web3Service.service.tokens!.xbit.address
      ),
    ]);
    if (xbitSupply !== null && poolSize !== null) {
      const [jkpt, xbit] = [parseFloat(poolSize), parseFloat(xbitSupply)];
      const price = xbit === 0 ? 1 : jkpt / xbit;
      setXbitPrice(price);
    }
  }, [isWeb3ServiceInited, jkptTokenAddress]);

  useEffect(() => {
    loadPrice();
  }, [loadPrice, chainId]);

  return xbitPrice;
};

export const usePoolSize = (tokenAddress: string) => {
  const [poolSize, setPoolSize] = useState<string | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);

  const loadPoolSize = useCallback(async () => {
    if (!isWeb3ServiceInited) return;
    const poolSize = await Web3Service.service.getPoolSize(tokenAddress);
    setPoolSize(poolSize);
  }, [isWeb3ServiceInited, tokenAddress]);

  useEffect(() => {
    loadPoolSize();
  }, [loadPoolSize, chainId]);

  return Number(poolSize).toFixed(4).toString();
};

export const useJkpt = (tokenAddress: string) => {
  const token = Token.getTokenByAddress(tokenAddress);
  const priceMap = useAtomValue(priceAtom);
  return { jkptPrice: priceMap[token.name], jkptName: token.name };
};

const f = parseFloat;
export const usePrizeItems = (
  probabilityTable: ProbabilityTable,
  ticketValue = 1
) => {
  const { outputToken, rewards } = probabilityTable;

  const poolSize = usePoolSize(outputToken);
  const { jkptPrice, jkptName } = useJkpt(outputToken);

  const prizeItems = useMemo(() => {
    if (!jkptPrice || !poolSize) return [];
    return rewards.map((r) => {
      const { type, reward, expect } = r;
      const prize =
        type === Relatives.Input
          ? (reward / 1e6) * ticketValue
          : (reward * f(poolSize)) / 1e6;

      const possibility =
        type === Relatives.Input
          ? expect / reward
          : expect / (f(poolSize) * jkptPrice * reward);

      return {
        prize,
        jkptName,
        possibility,
        isFixedReward: r.type === Relatives.Input,
      };
    });
  }, [jkptName, jkptPrice, poolSize, rewards, ticketValue]);
  return prizeItems;
};
