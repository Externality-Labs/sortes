import { useCallback, useEffect, useState } from 'react';
import { Web3Service } from '../services/web3';
import { useCurrentUser } from './user';
import { useAtomValue } from 'jotai';
import { web3ServiceInitedAtom } from '../atoms/web3';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { currentChainInfo } from '../utils/env';
import Token from '../utils/token';

interface SortesUserBalances {
  xexpSpent: string;
  goodRedeemed: string;
  goodClaimed: string;
}

export const useSortesUserBalances = () => {
  const [userBalances, setUserBalances] = useState<SortesUserBalances>({
    xexpSpent: '0',
    goodRedeemed: '0',
    goodClaimed: '0',
  });
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const { address } = useCurrentUser();
  const tokens = currentChainInfo().tokens;

  const loadUserBalances = useCallback(async () => {
    if (!address || !isWeb3ServiceInited || !tokens.good || !tokens.xexp)
      return;
    const { xexpSpent, goodClaimed, goodRedeemed } =
      await Web3Service.service.getSortesUserBalances();
    setUserBalances({
      xexpSpent: formatUnits(xexpSpent, tokens.xexp.decimals),
      goodRedeemed: formatUnits(goodRedeemed, tokens.good?.decimals),
      goodClaimed: formatUnits(goodClaimed, tokens.good?.decimals),
    });
  }, [address, isWeb3ServiceInited, tokens.good, tokens.xexp]);

  useEffect(() => {
    loadUserBalances();
  }, [loadUserBalances]);

  return {
    xexpSpent: parseInt(userBalances.xexpSpent).toString(),
    goodRedeemed: parseInt(userBalances.goodRedeemed).toString(),
    goodClaimed: parseInt(userBalances.goodClaimed).toString(),
    goodClaimable: (
      parseInt(userBalances.goodRedeemed) - parseInt(userBalances.goodClaimed)
    ).toString(),
  };
};

export const useAMM = () => {
  const [goodPrice, setGoodPrice] = useState<number>(0);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  const loadGoodPrice = useCallback(async () => {
    if (!isWeb3ServiceInited) return;
    const goodPrice = await Web3Service.service.contracts?.sortes?.amm(
      parseUnits('1', Token.getTokenByName('xexp').decimals)
    );
    setGoodPrice(
      Number(formatUnits(goodPrice, Token.getTokenByName('good').decimals))
    );
  }, [isWeb3ServiceInited]);

  useEffect(() => {
    loadGoodPrice();
  }, [loadGoodPrice]);

  return { goodPrice };
};
