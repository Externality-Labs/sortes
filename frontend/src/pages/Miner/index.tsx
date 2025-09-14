import PrizePoolChart from './PrizePoolChart';
import Wallet from './Wallet';

import Tabs from '../../components/Tabs';
import DepositHistory from './DepositHistory';
import WithdrawHistory from './WithdrawHistory';
import Token from '../../utils/token';
import { currentChainInfo, isMobileWeb } from '../../utils/env';
import JkptIcon from '../../components/jkpt/Icon';
import { getPoolSize, getXbitPrice } from '../../services/api/xbit';
import { useState, useEffect } from 'react';

interface TokenPair {
  tokenAddress: string;
  lpAddress: string;
  poolSize?: number;
  priceIncrement?: number;
  showDetail?: boolean;
}

const MinerPage = () => {
  const jkpts = currentChainInfo().jkpts;
  const [tokenPairs, setTokenPairs] = useState<TokenPair[]>([]);

  useEffect(() => {
    const loadTokenPairsWithPoolSize = async () => {
      try {
        // 首先创建基础的 tokenPairs
        const basePairs = jkpts.map((tokenAddress) => ({
          tokenAddress,
          lpAddress:
            Token.getTokenByAddress(tokenAddress).getPairsToken()!.address,
        }));

        // 为每个代币获取最新的 poolSize 和 priceIncrement
        const pairsWithPoolSizeAndPrice = await Promise.all(
          basePairs.map(async (pair) => {
            try {
              // 获取矿池大小数据
              const poolData = await getPoolSize(
                pair.tokenAddress,
                Date.now() - 30 * 24 * 60 * 60 * 1000 // 获取最近30天的数据用于计算
              );
              const latestPoolSize =
                poolData.length > 0
                  ? poolData[poolData.length - 1].poolSize
                  : 0;

              // 获取价格数据并计算7天年化收益率
              let priceIncrement = 0;
              try {
                const priceData = await getXbitPrice(
                  pair.tokenAddress,
                  pair.lpAddress,
                  Date.now() - 30 * 24 * 60 * 60 * 1000 // 获取最近30天的数据
                );

                if (priceData.length > 0) {
                  // 辅助函数：找到最接近给定时间的数据
                  const findClosestData = (data: any[], targetTime: number) => {
                    return data.reduce((prev, curr) =>
                      Math.abs(curr.time - targetTime) <
                      Math.abs(prev.time - targetTime)
                        ? curr
                        : prev
                    );
                  };

                  const currentTime = Date.now();
                  const latestPrice = priceData[priceData.length - 1].price;
                  const oneWeekAgoPrice = findClosestData(
                    priceData,
                    currentTime - 7 * 24 * 60 * 60 * 1000
                  );

                  // 计算7天年化收益率，使用与PrizePoolChart相同的算法
                  priceIncrement =
                    (((latestPrice - oneWeekAgoPrice.price) /
                      oneWeekAgoPrice.price) *
                      100 *
                      365) /
                    7;
                }
              } catch (priceError) {
                console.error(
                  `Failed to load price data for ${pair.tokenAddress}:`,
                  priceError
                );
              }

              return {
                ...pair,
                poolSize: latestPoolSize,
                priceIncrement,
              };
            } catch (error) {
              console.error(
                `Failed to load data for ${pair.tokenAddress}:`,
                error
              );
              return {
                ...pair,
                poolSize: 0,
                priceIncrement: 0,
              };
            }
          })
        );

        console.log('pairsWithPoolSizeAndPrice', pairsWithPoolSizeAndPrice);
        setTokenPairs(pairsWithPoolSizeAndPrice);
      } catch (error) {
        console.error('Failed to load token pairs:', error);
      }
    };

    loadTokenPairsWithPoolSize();
  }, [jkpts]);

  return (
    <div>
      <div className="flex flex-col space-y-4 bg-mainV1 pb-[100px] pt-20 max-sm:py-0 max-sm:pb-10">
        {tokenPairs.map(
          ({
            tokenAddress,
            lpAddress,
            poolSize,
            priceIncrement,
            showDetail,
          }) => (
            <div
              key={tokenAddress}
              className="mx-auto w-[1100px] rounded-2xl bg-white px-9 py-6 max-sm:mx-3 max-sm:w-auto max-sm:rounded-lg max-sm:p-4"
            >
              <div
                className="flex cursor-pointer items-center space-x-[102px] max-sm:justify-between max-sm:space-x-[18px]"
                onClick={() => {
                  setTokenPairs((prevPairs) =>
                    prevPairs.map((pair) =>
                      pair.tokenAddress === tokenAddress
                        ? { ...pair, showDetail: !pair.showDetail }
                        : pair
                    )
                  );
                }}
              >
                <section className="flex flex-col">
                  <h2 className="mb-1 text-base font-normal max-sm:text-[10px]">
                    Pool
                  </h2>
                  <div className="flex items-center">
                    <JkptIcon
                      tokenAddress={tokenAddress}
                      sizeClz="w-[26px] max-sm:w-[12px]"
                    />
                    <span className="ml-2 text-xl text-[#3370FF] max-sm:ml-[2px] max-sm:text-sm">
                      {Token.getTokenByAddress(tokenAddress).name.toUpperCase()}
                    </span>
                  </div>
                </section>

                <section className="flex flex-col max-sm:hidden md:w-[120px]">
                  <h2 className="mb-1 text-base font-normal max-sm:text-[10px]">
                    Address
                  </h2>
                  <div className="flex items-center">
                    <span className="text-xl text-[#3370FF]">
                      {`${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`}
                    </span>
                  </div>
                </section>

                <section className="flex flex-col md:w-[150px]">
                  <h2 className="mb-1 text-base font-normal max-sm:text-[10px]">
                    Size
                  </h2>
                  <div className="flex items-center">
                    <span className="text-xl text-[#3370FF] max-sm:text-sm">
                      {poolSize?.toFixed(2) || '0.00'}{' '}
                      {Token.getTokenByAddress(tokenAddress).name.toUpperCase()}
                    </span>
                  </div>
                </section>

                <section className="flex flex-col md:w-[150px]">
                  <h2 className="mb-1 text-base font-normal max-sm:text-[10px]">
                    Jackpot
                  </h2>
                  <div className="flex items-center">
                    <span className="text-xl text-[#3370FF] max-sm:text-sm">
                      1.23 WBTC
                    </span>
                  </div>
                </section>

                <section className="flex flex-col">
                  <h2 className="mb-1 text-base font-normal max-sm:text-[10px]">
                    7d Yield
                  </h2>
                  <div className="flex items-center">
                    <span
                      className={`text-xl max-sm:text-sm ${
                        (priceIncrement ?? 0) > 0
                          ? 'text-[#93DC08]'
                          : (priceIncrement ?? 0) < 0
                            ? 'text-[#FF925C]'
                            : 'text-[#6A79FF]'
                      }`}
                    >
                      {(priceIncrement ?? 0) > 0 ? '+' : ''}
                      {(priceIncrement ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </section>
              </div>

              {showDetail && (
                <>
                  <div className="my-6 h-[1px] bg-[#E7E7E9]" />

                  <section className="mx-auto flex w-full max-w-[1300px] max-sm:flex-col-reverse">
                    <PrizePoolChart
                      tokenAddress={tokenAddress}
                      lpAddress={lpAddress}
                    />
                    <Wallet
                      tokenAddress={tokenAddress}
                      setTokens={(newTokenAddress, newLpAddress) => {
                        // 这里可以添加切换逻辑，或者移除这个功能因为现在显示所有代币
                        console.log(
                          'Token switched:',
                          newTokenAddress,
                          newLpAddress
                        );
                      }}
                    />
                  </section>
                </>
              )}
            </div>
          )
        )}
      </div>
      <div className="mx-auto w-[1200px] pb-10 pt-20 max-sm:w-full max-sm:pb-[52px] max-sm:pt-10">
        <div className="max-sm:w-[calc(100vw-20px)] max-sm:overflow-x-auto">
          <div className="">
            <Tabs
              labels={
                isMobileWeb
                  ? ['Deposit', 'Withdraw']
                  : ['Deposit History', 'Withdraw History']
              }
            >
              <DepositHistory />
              <WithdrawHistory />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerPage;
