//import { ChainId } from '../../../../atoms/chain';
//import { currentChainInfo } from '../../../../utils/env';

export const DrawAmount = {
  OneUSD: 1,
  FiveUSD: 5,
  TenUSD: 10,
  TwentyUSD: 20,
  FiftyUSD: 50,
  OnHundredUSD: 100,
};

export const MaxDrawAmount = 100;
// export const getMinTicketPrice = () =>
//   currentChainInfo().chainId === ChainId.BNB ? 10 : 1;
export const getMinTicketPrice = () => 1;
