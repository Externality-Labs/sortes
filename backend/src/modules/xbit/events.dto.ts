class BaseWeb3EventDto {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  transactionIndex: number;
}

export class TokenDepositedEventDto extends BaseWeb3EventDto {
  user: string;
  tokenName: string;
  tokenAddress: string;
  tokenAmount: number;
  lpAmount: number;
}
export class TokenWithdrawnEventDto extends BaseWeb3EventDto {
  user: string;
  tokenName: string;
  tokenAddress: string;
  tokenAmount: number;
  lpAmount: number;
}

export class PlayFulfilledEventDto extends BaseWeb3EventDto {
  fulfilled: boolean;
  playId: string;
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

export class WinnerRankingDto {
  player: string;
  blockNumber: number;
  blockTimestamp: number;
  outputUsdValue: number;
  inputUsdValue: number;
  xexpAmount: number;
  luckyRatio: number;
}
