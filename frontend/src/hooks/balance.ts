import { useCallback, useEffect, useState } from 'react';
import { Web3Service } from '../services/web3';
import { useCurrentUser } from './user';
import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { web3ServiceInitedAtom } from '../atoms/web3';
import { chainAtom } from '../atoms/chain';
import {
  goodBalanceAtom,
  goodBalanceLoadingAtom,
  xexpBalanceAtom,
  xexpBalanceLoadingAtom,
} from '../atoms/balance';
import { chainInfoMap } from '../utils/env';
import Token from '../utils/token';
import { Tokens } from '../utils/address';
import api from '../services/api';
import { donationHistoryData } from '../pages/Charity/donationHistoryData';
import { useJkpt } from './pool';
export const useJkptBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState<string | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);
  const { address } = useCurrentUser();
  const { jkptName } = useJkpt(tokenAddress);

  const loadBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;
    const balance = await Web3Service.service.getBalance(
      jkptName as keyof Tokens,
      address
    );
    setBalance(balance);
  }, [address, isWeb3ServiceInited, jkptName]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance, chainId]);

  return { balance, loadBalance };
};

export const useXbitBalance = (tokenAddress: string) => {
  const [xbitBalance, setXbitBalance] = useState<string | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);
  const { address } = useCurrentUser();
  const { jkptName } = useJkpt(tokenAddress);

  const loadXbitBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;
    const xbit = await Web3Service.service.getBalance(
      Token.getTokenByName(jkptName).getPairsToken()?.name as keyof Tokens,
      address
    );
    setXbitBalance(xbit);
  }, [address, isWeb3ServiceInited, jkptName]);

  useEffect(() => {
    loadXbitBalance();
  }, [loadXbitBalance, chainId]);

  return { xbitBalance, loadXbitBalance };
};

export const useXexpBalance = () => {
  const [xexpBalance, setXexpBalance] = useAtom(xexpBalanceAtom);
  const setXexpBalanceLoading = useSetAtom(xexpBalanceLoadingAtom);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);
  const { address } = useCurrentUser();

  const loadXexpBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;

    try {
      setXexpBalanceLoading(true);
      const xexp = await Web3Service.service.getBalance('xexp', address);
      setXexpBalance(parseInt(xexp || '0').toString());
    } catch (error) {
      console.error('Error loading XEXP balance:', error);
    } finally {
      setXexpBalanceLoading(false);
    }
  }, [address, isWeb3ServiceInited, setXexpBalance, setXexpBalanceLoading]);

  useEffect(() => {
    loadXexpBalance();
  }, [loadXexpBalance, chainId]);

  return { xexpBalance, loadXexpBalance };
};

export const useGoodBalance = () => {
  const [goodBalance, setGoodBalance] = useAtom(goodBalanceAtom);
  const setGoodBalanceLoading = useSetAtom(goodBalanceLoadingAtom);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const { address } = useCurrentUser();

  const loadGoodBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;

    try {
      setGoodBalanceLoading(true);
      const good = await Web3Service.service.getBalance('good', address);
      setGoodBalance(parseInt(good || '0').toString());
    } catch (error) {
      console.error('Error loading GOOD balance:', error);
    } finally {
      setGoodBalanceLoading(false);
    }
  }, [address, isWeb3ServiceInited, setGoodBalance, setGoodBalanceLoading]);

  useEffect(() => {
    loadGoodBalance();
  }, [loadGoodBalance]);

  return { goodBalance, loadGoodBalance };
};

export const useUsdtBalance = () => {
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);
  const { address } = useCurrentUser();

  const loadUsdtBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;
    const usdt = await Web3Service.service.getBalance('usdt', address);
    setUsdtBalance(usdt);
  }, [address, isWeb3ServiceInited]);

  useEffect(() => {
    loadUsdtBalance();
  }, [loadUsdtBalance, chainId]);

  return { usdtBalance, loadUsdtBalance };
};
export const useUsdcBalance = () => {
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isUsdcSupported, setIsUsdcSupported] = useState<boolean>(true);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const chainId = useAtomValue(chainAtom);
  const { address } = useCurrentUser();

  const loadUsdcBalance = useCallback(async () => {
    if (!address || !isWeb3ServiceInited) return;
    try {
      const usdc = await Web3Service.service.getBalance('usdc', address);
      setUsdcBalance(usdc);
      setIsUsdcSupported(true);
    } catch (error) {
      console.error('fail:', error);
      setUsdcBalance(null);
      setIsUsdcSupported(false);
    }
  }, [address, isWeb3ServiceInited]);

  useEffect(() => {
    loadUsdcBalance();
  }, [loadUsdcBalance, chainId]);

  return { usdcBalance, loadUsdcBalance, isUsdcSupported };
};

export const useCharityBalance = () => {
  const [charityBalance, setCharityBalance] = useState<number | null>(null);
  const donatedFunds = donationHistoryData.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const chainId = useAtomValue(chainAtom);

  const loadCharityBalance = useCallback(async () => {
    const balances = await Promise.all(
      Object.values(chainInfoMap)
        .filter((info) => !info.isTestnet)
        .map((info) => api.get(info.apiEndpoint + 'xbit/charity-balance'))
    );

    setCharityBalance(
      balances.reduce((acc: number, res: any) => acc + res.balance, 0)
    );
  }, []);

  useEffect(() => {
    loadCharityBalance();
  }, [loadCharityBalance, chainId]);

  return {
    totalFunds: (charityBalance ?? 0) + donatedFunds,
    donatedFunds: donatedFunds,
    fundsToDonate: charityBalance,
  };
};
