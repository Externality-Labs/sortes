import { chainInfoMap, currentChainInfo } from './env';

interface TokenInfo {
  address: string;
  name: string;
  decimals: number;
  chainName: string;
}

interface TokenMap {
  [key: string]: Token;
}

export default class Token {
  address: string;
  name: string;
  decimals: number;
  chainName: string;
  pairsToken?: Token;
  isLpToken = false;
  static allTokenMaps: { [key: string]: TokenMap } = {};

  static get tokenMap() {
    if (!Token.allTokenMaps[currentChainInfo().name]) {
      Token.allTokenMaps[currentChainInfo().name] = {};
    }
    return Token.allTokenMaps[currentChainInfo().name];
  }

  constructor({ address, name, decimals, chainName }: TokenInfo) {
    this.address = address;
    this.name = name;
    this.decimals = decimals;
    this.chainName = chainName;
    if (!Token.allTokenMaps[chainName]) {
      Token.allTokenMaps[chainName] = {};
    }
    Token.allTokenMaps[chainName][name] = this;
  }

  static getTokenByName(
    name: string,
    chainName = currentChainInfo().name
  ): Token {
    const token = Token.allTokenMaps[chainName][name];
    if (!token) {
      throw new Error(`Token with name ${name} not found`);
    }
    return token;
  }

  static getTokenByAddress(
    address: string,
    chainName = currentChainInfo().name
  ): Token {
    const token = Object.values(Token.allTokenMaps[chainName]).find(
      (token) => token.address.toLowerCase() === address.toLowerCase()
    );
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

  getPairsToken() {
    return this.pairsToken;
  }
}

Object.values(chainInfoMap).forEach((chainInfo) => {
  Object.keys(chainInfo.tokens).forEach((name) => {
    const token = chainInfo.tokens[name as keyof typeof chainInfo.tokens];
    if (!token) return;
    const { address, decimals } = token;
    return new Token({
      address,
      name,
      decimals: Number(decimals),
      chainName: chainInfo.name,
    });
  });

  function makePair(name: string, lpName: string) {
    if (
      Token.allTokenMaps[chainInfo.name][name] !== undefined &&
      Token.allTokenMaps[chainInfo.name][lpName] !== undefined
    ) {
      Token.pairs(
        Token.getTokenByName(name, chainInfo.name),
        Token.getTokenByName(lpName, chainInfo.name)
      );
    }
  }

  [
    ['wbtc', 'xWbtc'],
    ['weth', 'xWeth'],
    ['usdc', 'xUsdc'],
    ['usdt', 'xUsdt'],
    ['wbnb', 'xWbnb'],
  ].forEach(([name, lpName]) => {
    makePair(name, lpName);
  });
});
