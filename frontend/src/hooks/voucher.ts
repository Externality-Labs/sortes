import { useCallback, useEffect, useState } from 'react';
import { Web3Service } from '../services/web3';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { refreshVoucherAtom, web3ServiceInitedAtom } from '../atoms/web3';
import { useAtomValue, useAtom } from 'jotai';
import Token from '../utils/token';

const useVoucher = (amount: number, inputToken: Token, repeats = 1) => {
  const [voucherQuantity, setVoucherQuantity] = useState(0);
  const [voucherId, setVoucherId] = useState<BigNumber | null>(null);
  const isWeb3ServiceInited = useAtomValue(web3ServiceInitedAtom);
  const [refreshVoucher] = useAtom(refreshVoucherAtom);
  const fetchVoucherId = useCallback(async () => {
    const id = await Web3Service.service.getVoucherId(
      inputToken,
      parseUnits(amount.toString(), inputToken.decimals),
      parseUnits(repeats.toString(), 0)
    );
    setVoucherId(id);
  }, [amount, inputToken, repeats]);

  const fetchVoucherQuantity = useCallback(async () => {
    if (voucherId === null) return;
    const quantity = await Web3Service.service.getVoucherQuantity(voucherId);
    setVoucherQuantity(quantity.toNumber());
  }, [voucherId]);

  useEffect(() => {
    if (!isWeb3ServiceInited) return;
    fetchVoucherId();
  }, [fetchVoucherId, isWeb3ServiceInited]);

  useEffect(() => {
    if (!isWeb3ServiceInited) return;
    fetchVoucherQuantity();
  }, [fetchVoucherQuantity, isWeb3ServiceInited, refreshVoucher]);

  return { voucherQuantity, voucherId };
};
export default useVoucher;
