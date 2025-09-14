type TokenInfo = {
  address: string;
  decimals: string;
};

export type Tokens = {
  usdt: TokenInfo;
  usdc: TokenInfo;
  weth?: TokenInfo;
  wbtc?: TokenInfo;
  wbnb?: TokenInfo;
  voucher: TokenInfo;
  xexp: TokenInfo;
  xbit: TokenInfo;
  xUsdt: TokenInfo;
  xUsdc: TokenInfo;
  xWeth?: TokenInfo;
  xWbtc?: TokenInfo;
  xWbnb?: TokenInfo;
  sortes?: TokenInfo;
  good?: TokenInfo;
  charity?: TokenInfo;
  locker?: TokenInfo;
};

export type Token = keyof Tokens;
