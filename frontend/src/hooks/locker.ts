import { useAtomValue } from 'jotai';
import { useCurrentUser } from './user';
import { web3ServiceInitedAtom } from '../atoms/web3';
import { useCallback, useEffect, useState } from 'react';
import { Web3Service } from '../services/web3';
import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { currentChainInfo } from '../utils/env';
import { showError, showSucc } from '../utils/notify';

export const useLocker = () => {
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [lockedAmount, setLockedAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [claimAllLoading, setClaimAllLoading] = useState(false);

  const { address } = useCurrentUser();
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);

  const fetchData = useCallback(async () => {
    const lockerContract = Web3Service.service.contracts?.locker as Contract;
    const [
      { claimableAmount, lockedAmount },
      { receivedAmount, claimedAmount },
    ] = await Promise.all([
      lockerContract.queryToken(address),
      lockerContract.getUserHistory(address),
    ]);

    const format = (goodAmount: BigNumber) => {
      return Number(
        formatUnits(goodAmount, currentChainInfo().tokens.good?.decimals)
      );
    };

    setClaimableAmount(format(claimableAmount));
    setLockedAmount(format(lockedAmount));
    setReceivedAmount(format(receivedAmount));
    setClaimedAmount(format(claimedAmount));
  }, [address]);

  const claimAll = useCallback(async () => {
    if (!address || !isWeb3ServiceInited || claimAllLoading) return;

    setClaimAllLoading(true);

    try {
      const lockerContract = Web3Service.service.contracts?.locker as Contract;
      const trx = await lockerContract.claimToken(address);
      await trx.wait();
      fetchData();
      showSucc('Claim successfully!');
    } catch (e: any) {
      showError(e.message);
    } finally {
      setClaimAllLoading(false);
    }
  }, [address, claimAllLoading, fetchData, isWeb3ServiceInited]);

  useEffect(() => {
    if (address && isWeb3ServiceInited) {
      fetchData();
    }
  }, [address, isWeb3ServiceInited, fetchData]);

  return {
    claimableAmount,
    lockedAmount,
    receivedAmount,
    claimedAmount,
    claimAll,
  };
};
