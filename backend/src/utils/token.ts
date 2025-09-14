import { chainInfoMap, currentChainName, isBridgeService } from './constant';

interface TokenInfo {
  address: string;
  name: string;
  decimals: number;
}

export default class Token {
  address: string;
  name: string;
  decimals: number;
  pairsToken: Token;
  isLpToken = false;
  static tokenMap: { [key: string]: Token } = {};

  constructor({ address, name, decimals }: TokenInfo) {
    this.address = address;
    this.name = name;
    this.decimals = decimals;
    Token.tokenMap[name] = this;
  }

  static getTokenByName(name: string): Token {
    const token = Token.tokenMap[name];
    if (!token) {
      throw new Error(`Token with name ${name} not found`);
    }
    return token;
  }

  static getTokenByAddress(address: string): Token {
    const token = Object.values(Token.tokenMap).find((token) => token.address.toLowerCase() === address.toLowerCase());
    if (!token) {
      throw new Error(`Token with address ${address} not found`);
    }
    return token;
  }

  static pairs(token: Token, lpToken: Token) {
    token.pairsToken = lpToken;
    lpToken.pairsToken = token;

    token.isLpToken = false;
    lpToken.isLpToken = true;
  }

  getPairToken() {
    return this.pairsToken;
  }
}

// initialize tokens
function makePair(name: string, lpName: string) {
  if (Token.tokenMap[name] !== undefined && Token.tokenMap[lpName] !== undefined) {
    Token.pairs(Token.getTokenByName(name), Token.getTokenByName(lpName));
  }
}
if (!isBridgeService) {
  Object.keys(chainInfoMap[currentChainName].tokens).map((name) => {
    const { address, decimals } = chainInfoMap[currentChainName].tokens[name];
    return new Token({ address, name, decimals });
  });
  [
    ['wbnb', 'xWbnb'],
    ['wbtc', 'xWbtc'],
    ['weth', 'xWeth'],
    ['usdc', 'xUsdc'],
    ['usdt', 'xUsdt'],
  ].forEach(([name, lpName]) => {
    makePair(name, lpName);
  });
}
