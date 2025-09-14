import { Tokens } from './address';
import ethLogo from '../assets/chains-logos/eth.svg';
// import arbLogo from '../assets/chains-logos/arbitrum.svg';
// import taikoLogo from '../assets/chains-logos/taiko.svg';
// import baseLogo from '../assets/chains-logos/base.svg';
// import bscLogo from '../assets/chains-logos/bsc.svg';

import usdtPng from '../assets/icons/icon-USDT.png';
import usdcPng from '../assets/icons/icon-USDC2.png';
import wbtcPng from '../assets/icons/icon-WBTC.png';
import wethPng from '../assets/icons/icon-WETH.png';
import { getDefaultStore } from 'jotai';
import { chainAtom } from '../atoms/chain';
import { ChainId } from '../atoms/chain';
type ChainName =
  | 'Ethereum Sepolia'
  | 'Arbitrum One'
  | 'Base Mainnet'
  | 'BNB Chain';
// | 'Ethereum Mainnet'
// | 'Hekla';

export type tokenListType = {
  icon: string;
  title: string;
};

export const topTokenList: tokenListType[] = [
  { icon: usdtPng, title: 'USDT' },
  { icon: usdcPng, title: 'USDC' },
];

export const bottomTokenList: tokenListType[] = [
  { icon: usdtPng, title: 'USDT' },
  { icon: usdcPng, title: 'USDC' },
  { icon: wbtcPng, title: 'WBTC' },
  { icon: wethPng, title: 'WETH' },
];

export interface ChainInfo {
  name: ChainName;
  chainId: ChainId;
  gasLimit: number;
  playGasLimit: (value: number) => number;
  tokens: Tokens;
  scanner: string;
  rpcUrl: string;
  logo: string;
  apiEndpoint: string;
  defaultSwapId: string;
  xTokenName: string;
  isTestnet: boolean;
  randomness: RandomnessSource;
  coordinatorAddress?: string;
  token: 'ETH' | 'BNB';
  jkpts: string[];
}

export enum RandomnessSource {
  Chainlink = 'chainlink',
  Arpa = 'arpa',
}

const domainMap = {
  development: {
    app: 'app.sortes.fun',
    home: 'sortes.fun',
    api: 'localhost:9300',
  },
  uat: {
    app: 'app-uat.sortes.fun',
    home: 'uat.sortes.fun',
    api: 'api-uat.sortes.fun',
  },
  production: {
    app: 'app.sortes.fun',
    home: 'sortes.fun',
    api: 'api.sortes.fun',
  },
};

const procotolMap = {
  development: 'http',
  uat: 'https',
  production: 'https',
};

const env = (process.env.NODE_ENV || 'production') as
  | 'development'
  | 'uat'
  | 'production';

export const appDomain = domainMap[env].app;
export const homeDomain = domainMap[env].home;
export const apiDomain = domainMap[env].api;
export const protocol = procotolMap[env];

export const appPage = `https://${appDomain}`;
export const metamaskDeeplink = `https://metamask.app.link/dapp/${appDomain}`;

const SepoliaTokens = window.__APP_METADATA__.tokens['sepolia'];

export const chainInfoMap: { [key in ChainId]: ChainInfo } = {
  // [ChainId.Arbitrum]: {
  //   name: 'Arbitrum One',
  //   token: 'ETH',
  //   chainId: ChainId.Arbitrum,
  //   gasLimit: 2000000,
  //   playGasLimit: () => 2000000,
  //   tokens: ArbitrumTokens,
  //   scanner: 'https://arbiscan.io/tx/',
  //   rpcUrl: 'https://arb1.arbitrum.io/rpc',
  //   logo: arbLogo,
  //   apiEndpoint: `${protocol}://${apiDomain}/arbitrum/`,
  //   jkpt: 'wbtc',
  //   xTokenName: 'X-WBTC',
  //   isTestnet: false,
  //   defaultSwapId: '1',
  //   randomness: RandomnessSource.Chainlink,
  //   coordinatorAddress: '0x3C0Ca683b403E37668AE3DC4FB62F4B29B6f7a3e',
  //   jkpts: [],
  // },
  // [ChainId.Hekla]: {
  //   name: 'Hekla',
  //   chainId: ChainId.Hekla,
  //   gasLimit: 2000000,
  //   playGasLimit: (value: number) => (value + 100) * 6000,
  //   tokens: HeklaTokens,
  //   scanner: 'https://hekla.etherscan.io/tx/',
  //   rpcUrl: 'https://rpc.hekla.taiko.xyz',
  //   logo: taikoLogo,
  //   apiEndpoint: `${protocol}://${apiDomain}/hekla`,
  //   defaultSwapId: '1',
  //   jkpt: 'taiko',
  //   xTokenName: 'X-TAIKO',
  //   isTestnet: true,
  //   randomness: RandomnessSource.Arpa,
  // },
  [ChainId.Sepolia]: {
    name: 'Ethereum Sepolia',
    token: 'ETH',
    chainId: ChainId.Sepolia,
    gasLimit: 6000000,
    playGasLimit: (value: number) => (value + 100) * 9000,
    tokens: SepoliaTokens,
    scanner: 'https://sepolia.etherscan.io/tx/',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/',
    logo: ethLogo,
    apiEndpoint: `${protocol}://${apiDomain}/sepolia/`,
    xTokenName: 'X-WBTC',
    defaultSwapId: '1',
    isTestnet: true,
    randomness: RandomnessSource.Chainlink,
    jkpts: [
      SepoliaTokens.wbtc!.address,
      SepoliaTokens.weth!.address,
      SepoliaTokens.wbnb!.address,
    ],
  },
  // [ChainId.Base]: {
  //   name: 'Base Mainnet',
  //   token: 'ETH',
  //   chainId: ChainId.Base,
  //   gasLimit: 3000000,
  //   playGasLimit: () => 1800000,
  //   tokens: BaseTokens,
  //   scanner: 'https://basescan.org/tx/',
  //   rpcUrl: 'https://mainnet.base.org',
  //   logo: baseLogo,
  //   apiEndpoint: `${protocol}://${apiDomain}/base/`,
  //   xTokenName: 'X-WETH',
  //   defaultSwapId: '1',
  //   isTestnet: false,
  //   randomness: RandomnessSource.Chainlink,
  //   coordinatorAddress: '0xd5d517abe5cf79b7e95ec98db0f0277788aff634',
  //   jkpts: [],
  // },
  // [ChainId.BNB]: {
  //   name: 'BNB Chain',
  //   token: 'BNB',
  //   chainId: ChainId.BNB,
  //   gasLimit: 3000000,
  //   playGasLimit: () => 2000000,
  //   tokens: BNBTokens,
  //   scanner: 'https://bscscan.com/tx/',
  //   // https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/
  //   // use third party RPC to enable eth_parseLog
  //   rpcUrl: 'https://bsc-pokt.nodies.app',
  //   logo: bscLogo,
  //   apiEndpoint: `${protocol}://${apiDomain}/bnb/`,
  //   xTokenName: 'X-WBNB',
  //   defaultSwapId: '1',
  //   isTestnet: false,
  //   randomness: RandomnessSource.Chainlink,
  //   coordinatorAddress: '0xd691f04bc0C9a24Edb78af9E005Cf85768F694C9',
  //   jkpts: [],
  // },
};
const store = getDefaultStore();
const getChainId = () => store.get(chainAtom);

export const currentChainInfo = () => chainInfoMap[getChainId()];
export const getTokenSymbolByAddress = (address: string): string => {
  const tokens = currentChainInfo().tokens;
  for (const [symbol, token] of Object.entries(tokens)) {
    if (token.address.toLowerCase() === address.toLowerCase()) {
      return symbol.toUpperCase();
    }
  }
  return address;
};

const getDynamicMetamaskAppPage = () =>
  isMobileWeb && !isMetaMaskBrowser ? metamaskDeeplink : appPage;

// 判断是否在移动Web环境
export const isMobileWeb =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// 判断是否在 MetaMask 浏览器中
export const isMetaMaskBrowser =
  typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;

export const BetaDynamicLink = getDynamicMetamaskAppPage();

export const DemoDynamicLink = getDynamicMetamaskAppPage();

export const slogan =
  "World's First Non-Profit and Trustless Social Welfare System";

export const AnimationDuration = {
  DICE_ROLLING: 9000, // 9秒
  BALL_DROPPING: 3000, // 3秒
  RESULT_DISPLAY: 3000, // 3秒
};
