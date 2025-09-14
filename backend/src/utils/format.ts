import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export const int256ToNumber = (int256: BigNumberish, decimals: number, fixed = 8): number => {
  return Number(Number(formatUnits(int256, decimals)).toFixed(fixed));
};
