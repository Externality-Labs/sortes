import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';
import path from 'path';
import './tasks/aloha';
import './tasks/faucet';
import './tasks/play';
import './tasks/convert';
import './tasks/account';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [
        process.env.TESTNET_PROD_PRIVATE_KEY ?? 'unknown',
        process.env.TESTNET_MAINTAINER_PRIVATE_KEY ?? 'unknown',
      ],
    },
    localhost: {
      chainId: 33333,
      url: 'http://127.0.0.1:8765',
    },
    hardhat: {
      chainId: 33333,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        blockNumber: 16700000,
      },
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [
        process.env.ARBITRUM_PROD_PRIVATE_KEY ?? 'unknown',
        process.env.ARBITRUM_MAINTAINER_PRIVATE_KEY ?? 'unknown',
      ],
    },
  },
};

export default config;
