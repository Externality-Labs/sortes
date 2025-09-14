import { ArbitrumTokens, BaseTokens, BNBTokens } from './address';
import * as dotenv from 'dotenv';
import metadata from './metadata.generated.json';

dotenv.config();

export enum Network {
  Sepolia = 'sepolia',
  Arbitrum = 'arbitrum',
  Hekla = 'hekla',
  Base = 'base',
  BNB = 'bnb',
}

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const sepoliaTokens = metadata.tokens.sepolia;

export const chainInfoMap = {
  [Network.Sepolia]: {
    chainId: 11155111,
    providerUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    tokens: sepoliaTokens,
    blocksCount30Days: 216000,
    jkpts: {
      [sepoliaTokens.wbtc?.address]: 11800,
      [sepoliaTokens.weth?.address]: 4000,
      [sepoliaTokens.wbnb?.address]: 800,
    },
  },
  [Network.Arbitrum]: {
    chainId: 42161,
    providerUrl: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    tokens: ArbitrumTokens,
    blocksCount30Days: 10368000,
  },
  // [Network.Hekla]: {
  //   chainId: 167009,
  //   providerUrl: 'https://rpc.hekla.taiko.xyz',
  //   tokens: HeklaTokens,
  // },
  [Network.Base]: {
    chainId: 8453,
    providerUrl: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    tokens: BaseTokens,
    blocksCount30Days: 1296000,
  },
  [Network.BNB]: {
    chainId: 56,
    providerUrl: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    tokens: BNBTokens,
    blocksCount30Days: 3456000,
  },
};

export const currentChainName = process.env.RANDSWAP_NETWORK as Network;
export const ChainId = currentChainName ? chainInfoMap[currentChainName].chainId : null;
export const ProviderUrl = currentChainName ? chainInfoMap[currentChainName].providerUrl : null;
export const isBridgeService = process.env.IS_BRIDGE_SERVICE === 'true';
