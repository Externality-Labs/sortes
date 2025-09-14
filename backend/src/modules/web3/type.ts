export interface Block {
  timestamp: number;
  blockNumber: number;
}

export interface BaseWeb3Event {
  blockNumber: number;
  blockHash: string;
  blockTimestamp: number;
  transactionIndex: number;
  transactionHash: string;
}
export interface PlayFulfilledEvent extends BaseWeb3Event {
  fulfilled: boolean;
  playId: string;
  player: string;
  inputToken: string;
  inputAmount: number;
  outputToken: string;
  repeats: number;
  tableTag: number;
  requestId: string;
  randomWord: number;
  outcomeLevels: boolean[];
  outputTotalAmount: number;
  outputXexpAmount: number;
}

export interface TokenDepositedEvent extends BaseWeb3Event {
  tokenAddress: string;
  tokenAmount: number;
  lpAmount: number;
  user: string;
}

export interface TokenWithdrawnEvent extends BaseWeb3Event {
  tokenAddress: string;
  lpAmount: number;
  tokenAmount: number;
  user: string;
}
