import { ProbabilityTableRewardType } from 'src/schemas/ProbabilityTable.schema';
import { chainInfoMap, currentChainName } from 'src/utils/constant';

export const getInitialTables = () => {
  const tokens = chainInfoMap[currentChainName].tokens;
  const initialTables = [
    {
      id: '1',
      name: 'Satoshi Jackpot',
      outputToken: tokens.wbtc?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 1 * 1e6, // 100% reward (1000000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 5 * 1e6, // 500% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 1000% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 0.1 * 1e6, // 10% Pool
        },
      ],
    },

    {
      id: '2',
      name: 'Bitcoin Mega Jackpot',
      outputToken: tokens.wbtc?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.12 * 1e6, // 12% expectation (120000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 5 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 400% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.08 * 1e6, // 8% expectation
          reward: 0.03 * 1e6, // 3% Pool
        },
      ],
    },

    {
      id: '3',
      name: 'Bitcoin Minor Jackpot',
      outputToken: tokens.wbtc?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.15 * 1e6, // 15% expectation
          reward: 1.5 * 1e6, // 150% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.05 * 1e6, // 5% expectation
          reward: 0.01 * 1e6, // 1% Pool
        },
      ],
    },
    {
      id: '4',
      name: 'Vitalik Jackpot',
      outputToken: tokens.weth?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 1 * 1e6, // 100% reward (1000000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 5 * 1e6, // 500% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 1000% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 0.1 * 1e6, // 10% Pool
        },
      ],
    },

    {
      id: '5',
      name: 'Ethereum Mega Jackpot',
      outputToken: tokens.weth?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.12 * 1e6, // 12% expectation (120000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 5 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 400% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.08 * 1e6, // 8% expectation
          reward: 0.03 * 1e6, // 3% Pool
        },
      ],
    },

    {
      id: '6',
      name: 'Ethereum Minor Jackpot',
      outputToken: tokens.weth?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.15 * 1e6, // 15% expectation
          reward: 1.5 * 1e6, // 150% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.05 * 1e6, // 5% expectation
          reward: 0.01 * 1e6, // 1% Pool
        },
      ],
    },

    {
      id: '7',
      name: 'CZ Jackpot',
      outputToken: tokens.wbnb?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 1 * 1e6, // 100% reward (1000000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 5 * 1e6, // 500% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 1000% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 0.1 * 1e6, // 10% Pool
        },
      ],
    },

    {
      id: '8',
      name: 'BNB Mega Jackpot',
      outputToken: tokens.wbnb?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.12 * 1e6, // 12% expectation (120000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 5 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 10 * 1e6, // 400% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.08 * 1e6, // 8% expectation
          reward: 0.03 * 1e6, // 3% Pool
        },
      ],
    },

    {
      id: '9',
      name: 'BNB Minor Jackpot',
      outputToken: tokens.wbnb?.address,
      image: 'https://img.sortes.fun/oranges/orange-50.png',
      rewards: [
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation (200000 / 1000000)
          reward: 0.5 * 1e6, // 50% reward (500000 / 1000000)
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.2 * 1e6, // 20% expectation
          reward: 1 * 1e6, // 100% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.15 * 1e6, // 15% expectation
          reward: 1.5 * 1e6, // 150% reward
        },
        {
          type: ProbabilityTableRewardType.Input,
          expect: 0.1 * 1e6, // 10% expectation
          reward: 2 * 1e6, // 200% reward
        },
        {
          type: ProbabilityTableRewardType.Pool,
          expect: 0.05 * 1e6, // 5% expectation
          reward: 0.01 * 1e6, // 1% Pool
        },
      ],
    },
  ];
  return initialTables.filter((table) => table.outputToken);
};
