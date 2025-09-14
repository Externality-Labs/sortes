import ReactEcharts from 'echarts-for-react';
import SwitchBtn from './SwitchBtn';
import Increment from './Increment';
import React, { useCallback, useEffect, useState } from 'react';
import { getPoolSize, getXbitPrice } from '../../../services/api/xbit';
import Loading from '../../../assets/animations/loading.json';
import Lottie from 'lottie-react';
import { useAtomValue } from 'jotai';
import { chainAtom } from '../../../atoms/chain';
import JkptIcon from '../../../components/jkpt/Icon';
import Tooltip from '../../../components/Tooltip.tsx';
import { Popup } from '../../../components/Modal/Popup.tsx';
import Token from '../../../utils/token.ts';
import { isMobileWeb } from '../../../utils/env';

const defaultPriceChartOption: any = {
  useUTC: true,
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#f0f4ff',
    borderColor: 'rgba(170, 170, 170, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    padding: [12, 16],
    textStyle: {
      color: '#6A79FF',
      fontSize: 14,
    },
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#6A79FF',
        type: 'dashed',
        width: 2,
        dashOffset: 0,
        dashArray: [0.5, 6],
      },
    },
    formatter: function (params: any[]) {
      const date = new Date(params[0].axisValue);
      const value = params[0].value;

      return `
           <div style="padding: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, -apple-system, sans-serif;">
            <style>
              @media (max-width: 640px) {
                .tooltip-content {
                  font-size: 12px !important;
                }
              }
            </style>
            <div class="tooltip-content" style="font-size: 14px;">
              <div>${date.toISOString().slice(0, 19).replace('T', ' ')}</div>
              <div style="margin-top: 20px; display: flex; align-items: center;">
                <span style="
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background-color: #6A79FF;
                  margin-right: 6px;
                "></span>
                <span style="color: #828898; margin-right: 10px;">Vol</span>
                <span>${typeof value[1] === 'number' ? value[1].toFixed(8) : value[1]}</span>
              </div>
            </div>
          </div>
        `;
    },
  },
  grid: {
    width: 'auto',
    height: 272,
    top: 5,
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: {
    type: 'time',
    max: function (value: { max: number }) {
      return value.max + 3600000;
    },
    axisLine: {
      lineStyle: {
        color: '#6A79FF',
      },
    },
  },
  yAxis: {
    type: 'value',
    show: true,
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
        type: 'dashed',
      },
    },
    axisLine: {
      show: false,
    },
    scale: true,
    boundaryGap: ['10%', '10%'],
  },
  series: [
    {
      data: null,
      type: 'line',
      symbol: 'circle',
      showSymbol: false, // 正常状态下不显示圆点
      symbolSize: 8,
      itemStyle: {
        color: () => {
          return '#FF884D';
        },
      },
      lineStyle: {
        color: '#6A79FF', // 线条的默认颜色
        width: 3.85,
      },
    },
  ],
};

const defaultCirculationChartOption: any = {
  useUTC: true,
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#f0f4ff',
    borderColor: 'rgba(170, 170, 170, 0.5)',
    borderWidth: 1,
    borderRadius: 8,
    padding: [12, 16],
    textStyle: {
      color: '#6A79FF',
      fontSize: 14,
    },
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#6A79FF',
        type: 'dashed',
        width: 2,
        dashOffset: 0,
        dashArray: [0.5, 6],
      },
    },
    formatter: function (params: any[]) {
      const date = new Date(params[0].axisValue);
      const value = params[0].value;

      return `
           <div style="padding: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, -apple-system, sans-serif;">
            <style>
              @media (max-width: 640px) {
                .tooltip-content {
                  font-size: 12px !important;
                }
              }
            </style>
            <div class="tooltip-content" style="font-size: 14px;">
              <div>${date.toISOString().slice(0, 19).replace('T', ' ')}</div>
              <div style="margin-top: 20px; display: flex; align-items: center;">
                <span style="
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background-color: #FF884D;
                  margin-right: 6px;
                "></span>
                <span style="color: #828898; margin-right: 10px;">Vol</span>
                <span>${typeof value[1] === 'number' ? value[1].toFixed(8) : value[1]}</span>
              </div>
            </div>
          </div>
        `;
    },
  },
  grid: {
    width: 'auto',
    height: 272,
    top: 5,
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: {
    type: 'time',
    max: function (value: { max: number }) {
      return value.max + 3600000;
    },
    axisLine: {
      lineStyle: {
        color: '#6A79FF',
      },
    },
  },
  yAxis: {
    type: 'value',
    show: true,
    axisLabel: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
        type: 'dashed',
      },
    },
    axisLine: {
      show: false,
    },
    scale: true,
    boundaryGap: ['10%', '10%'],
  },
  series: [
    {
      data: null,
      type: 'line',
      symbol: 'circle',
      showSymbol: false, // 正常状态下不显示圆点
      symbolSize: 8,
      itemStyle: {
        color: () => {
          return '#FF884D';
        },
      },
      lineStyle: {
        color: '#6A79FF', // 线条的默认颜色
        width: 3.85,
      },
    },
  ],
};

interface PricePoolChartProps {
  tokenAddress: string;
  lpAddress: string;
}

const PrizePoolChart: React.FC<PricePoolChartProps> = ({
  tokenAddress,
  lpAddress,
}) => {
  const [xbitPoolSize, setXbitPoolSize] = useState<string>('--');
  const [xbitPrice, setXbitPrice] = useState<string>('--');

  const [showLeftChart, setShowLeftChart] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [priceChartOption, setPriceChartOption] = useState<any>(
    defaultPriceChartOption
  );
  const [circulationChartOption, setCirculationChartOption] = useState<any>(
    defaultCirculationChartOption
  );
  const [circulationIncrement, setCirculationIncrement] = useState<number>(0);
  const [priceIncrement, setPriceIncrement] = useState<number>(0);
  const [hisoryPrice, setHisoryPrice] = useState<
    { day: string; value: number }[]
  >([]);
  const [historyPool, setHistoryPool] = useState<
    { day: string; value: number }[]
  >([]);

  const chainId = useAtomValue(chainAtom);
  const token = Token.getTokenByAddress(tokenAddress);
  const xTokenName = `X-${token.name.toUpperCase()}`;

  const handleSwitch = useCallback((newIdx: number) => {
    if (newIdx === 0) {
      setShowLeftChart(true);
    } else {
      setShowLeftChart(false);
    }
  }, []);
  const loadChartData = useCallback(async () => {
    const priceData = await getXbitPrice(
      tokenAddress,
      lpAddress,
      Date.now() - 30 * 86400000
    );
    const circulationData = await getPoolSize(
      tokenAddress,
      Date.now() - 30 * 86400000
    );
    const pLength = priceData.length;
    const cLength = circulationData.length;

    // 计算价格变化率
    const latestPrice = priceData[pLength - 1].price;

    // 辅助函数：找到最接近给定时间的数据
    const findClosestData = (data: any[], targetTime: number) => {
      return data.reduce((prev, curr) =>
        Math.abs(curr.time - targetTime) < Math.abs(prev.time - targetTime)
          ? curr
          : prev
      );
    };

    const currentTime = Date.now();

    // 计算价格变化率
    const oneDayAgoPrice = findClosestData(
      priceData,
      currentTime - 24 * 60 * 60 * 1000
    );
    const oneWeekAgoPrice = findClosestData(
      priceData,
      currentTime - 7 * 24 * 60 * 60 * 1000
    );
    const oneMonthAgoPrice = findClosestData(
      priceData,
      currentTime - 30 * 24 * 60 * 60 * 1000
    );

    // 计算矿池大小变化率
    const latestPool = circulationData[circulationData.length - 1].poolSize;
    const oneDayAgoPool = findClosestData(
      circulationData,
      currentTime - 24 * 60 * 60 * 1000
    );
    const oneWeekAgoPool = findClosestData(
      circulationData,
      currentTime - 7 * 24 * 60 * 60 * 1000
    );
    const oneMonthAgoPool = findClosestData(
      circulationData,
      currentTime - 30 * 24 * 60 * 60 * 1000
    );

    const calculateChangeRate = (oldValue: number, newValue: number) => {
      return ((newValue - oldValue) / oldValue) * 100;
    };

    // 设置价格历史数据
    setHisoryPrice([
      {
        day: 'D',
        value: calculateChangeRate(oneDayAgoPrice.price, latestPrice),
      },
      {
        day: 'W',
        value: calculateChangeRate(oneWeekAgoPrice.price, latestPrice),
      },
      {
        day: 'M',
        value: calculateChangeRate(oneMonthAgoPrice.price, latestPrice),
      },
    ]);

    // 设置矿池历史数据
    setHistoryPool([
      {
        day: 'D',
        value: calculateChangeRate(oneDayAgoPool.poolSize, latestPool),
      },
      {
        day: 'W',
        value: calculateChangeRate(oneWeekAgoPool.poolSize, latestPool),
      },
      {
        day: 'M',
        value: calculateChangeRate(oneMonthAgoPool.poolSize, latestPool),
      },
    ]);

    // 格式化价格和矿池大小数据
    const priceDataFormatted = priceData
      .sort((a, b) => a.time - b.time)
      .map((item) => {
        // 确保时间戳是 UTC 时间
        const utcTime = new Date(item.time).getTime();
        return [utcTime, item.price];
      });

    const poolSizeDataFormatted = circulationData
      .sort((a, b) => a.time - b.time)
      .map((item) => {
        // 确保时间戳是 UTC 时间
        const utcTime = new Date(item.time).getTime();
        return [utcTime, item.poolSize];
      });

    // Calculate circulation increment - use same logic as historyPool["W"]
    const c1 = oneWeekAgoPool.poolSize;
    const c2 = latestPool;
    setCirculationIncrement(((c2 - c1) / c1) * 100);

    // Calculate price increment
    const startPriceIndex =
      priceData.length >= 24 * 7 ? priceData.length - 24 * 7 : 0;
    const p1 = priceData[startPriceIndex].price;
    const p2 = priceData[priceData.length - 1].price;
    setPriceIncrement((((p2 - p1) / p1) * 100 * 365) / 7);

    setXbitPoolSize(circulationData[cLength - 1].poolSize.toFixed(4));
    setXbitPrice(priceData[pLength - 1].price.toFixed(8));

    const circulationChartOption = {
      ...defaultCirculationChartOption,
      series: [
        {
          ...defaultCirculationChartOption.series[0],
          data: poolSizeDataFormatted, // 使用矿池大小数据
        },
      ],
    };
    const priceChartOption = {
      ...defaultPriceChartOption,
      series: [
        {
          ...defaultPriceChartOption.series[0],
          data: priceDataFormatted, // 使用价格数据
        },
      ],
    };
    setCirculationChartOption(circulationChartOption);

    setPriceChartOption(priceChartOption);
    setLoading(false);
  }, [lpAddress, tokenAddress]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData, chainId]);

  const jkpt = token.name.toUpperCase();
  const chartTitle = showLeftChart ? `Pool(${jkpt})` : `${xTokenName} Price`;

  const chartValue = showLeftChart ? xbitPoolSize : xbitPrice;

  const [showHistoryPrice, setShowHistoryPrice] = useState(false);
  return (
    <div className="w-[529px] max-sm:mr-0 max-sm:w-full max-sm:pb-10">
      <div className="text-white">
        <div className="item-center flex text-xl max-sm:mb-[30px] max-sm:mt-10 max-sm:text-lg">
          <div className="-mt-[2px] max-sm:-mt-1 max-sm:size-5">
            <JkptIcon
              tokenAddress={tokenAddress}
              sizeClz="w-[26px] max-sm:w-4"
            />
          </div>

          <h1 className="relative ml-2 text-[#6A79FF] max-sm:text-base">
            {chartTitle}
            <div className="absolute -right-4 -top-3 size-[14px] max-sm:-right-3 max-sm:-top-2 max-sm:size-[10px]">
              <Tooltip type="info">
                <span className="absolute bottom-[20px] left-2 z-40 w-[300px] rounded bg-[#f7faff] p-[10px] text-xs text-[#6A79FF] max-sm:w-[200px] max-sm:text-[8px]">
                  {xTokenName} is minted by depositing Token into the Sortes
                  smart contract, with no other issuance methods. The value of
                  {xTokenName} is inherently linked to the size of the Token
                  pool on Sortes, growing in value with limited fluctuating with
                  users' each play. {xTokenName} serves as a record-keeping
                  certificate for depositing and withdrawing Token from the
                  prize pool.
                </span>
              </Tooltip>
            </div>
          </h1>

          <div
            className="cursor-pointer"
            onClick={() => setShowHistoryPrice(true)}
          >
            <Increment
              value={showLeftChart ? circulationIncrement : priceIncrement}
            ></Increment>
          </div>

          <Popup visible={showHistoryPrice} setVisible={() => null}>
            <div className="relative flex max-h-[684px] w-[358px] flex-col overflow-y-auto rounded-2xl bg-white px-1 py-10 text-left">
              <span
                onClick={() => setShowHistoryPrice(false)}
                className="absolute right-2.5 top-2.5 cursor-pointer"
              >
                <i className="iconfont icon-close-outlined text-2xl text-[#6A79FF]" />
              </span>
              <div className="flex flex-col text-xl text-[#6A79FF]">
                <h1 className="mx-auto my-[10px] mb-[30px]">
                  {showLeftChart
                    ? `Pool Size Change Rate`
                    : `Price Change Rate of ${xTokenName}`}
                </h1>

                <div className="mx-auto flex flex-col space-y-5">
                  {(showLeftChart ? historyPool : hisoryPrice).map((item) => {
                    return (
                      <div
                        key={item.day}
                        className="flex text-base font-normal"
                      >
                        <section
                          className={`flex w-[107px] justify-between text-base font-normal ${item}`}
                        >
                          <span className="">1{item.day}:</span>
                          <span
                            className={
                              item.value > 0
                                ? 'text-[#00D1B5]'
                                : item.value < 0
                                  ? 'text-[#FF925C]'
                                  : 'text-[#6A79FF]'
                            }
                          >
                            {(item.value > 0
                              ? '+'
                              : item.value < 0
                                ? '-'
                                : '') +
                              item.value.toFixed(2) +
                              '%'}
                          </span>
                        </section>
                        {item.value < 0 && (
                          <span
                            style={{ transform: 'scaleY(-1)' }}
                            className="iconfont icon-arrow-top-right ml-[10px] inline-block pt-[0.5px] text-[13px] text-[#FF925C]"
                          ></span>
                        )}
                        {item.value === 0 && (
                          <span className="iconfont icon-a-Line1Stroke ml-[10px] inline-block pt-[0.5px] text-[2.4px] text-[#6A79FF]"></span>
                        )}
                        {item.value > 0 && (
                          <span className="iconfont icon-arrow-top-right ml-[10px] inline-block pt-[0.5px] text-[13px] text-[#00D1B5]"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Popup>

          <h1 className="relative ml-[10px] font-bold text-[#6A79FF] max-sm:text-base">
            {showLeftChart
              ? 'Past Week'
              : isMobileWeb
                ? '7-Day APY'
                : '7-Day Annualized Yield'}
            <div className="absolute -right-3 -top-3 size-[14px] max-sm:-right-3 max-sm:-top-2 max-sm:size-[10px]">
              <Tooltip type="info">
                <span className="absolute bottom-[20px] left-2 z-40 w-[220px] rounded bg-[#f7faff] p-[10px] text-xs leading-normal text-[#6A79FF] max-sm:-left-[11rem] max-sm:w-[180px] max-sm:text-[8px]">
                  Price momentum compared to past week.
                  <h1 className="mt-1">24h change starts at 00:00 UTC</h1>
                </span>
              </Tooltip>
            </div>
          </h1>
        </div>
        <div className="mt-[30px] flex items-center">
          <span className="flex-1 text-[36px] text-[#6A79FF] max-sm:text-4xl">
            {isNaN(Number(chartValue))
              ? chartValue
              : Number(chartValue).toFixed(2) + ' '}
            {jkpt}
          </span>
        </div>
        <div className="flex justify-end">
          <SwitchBtn
            labels={['Circulation', 'Price']}
            initIdx={0}
            onSwitch={handleSwitch}
          ></SwitchBtn>
        </div>
      </div>
      <div id="chart-container" className="relative mt-[30px]">
        {loading && (
          <Lottie
            animationData={Loading}
            className="absolute left-1/2 top-1/2 ml-[-80px] mt-[-80px] h-[160px] w-[160px] rounded-[8px] bg-transparent"
          />
        )}
        {showLeftChart && (
          <div id="chart-circulation" className="h-[300px]">
            <ReactEcharts option={circulationChartOption} />
          </div>
        )}
        {!showLeftChart && (
          <div id="chart-price" className="h-[300px]">
            <ReactEcharts option={priceChartOption} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizePoolChart;
