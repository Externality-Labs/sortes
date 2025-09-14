import { useCallback, useEffect, useState } from 'react';
import {
  getExpRanking,
  getLuckyRanking,
  getWinnerRanking,
} from '../../../services/api/xbit';
import { getUserAvatar } from '../../../utils/avatarGenerator';
import { formatTime, formatUSD, readableAddr } from '../../../utils/format';
import { chainAtom } from '../../../atoms/chain';
import { useAtomValue } from 'jotai';
import PrizeBroadcast from '../../../components/PrizeBroadcast';

export interface RankingItem {
  rank: number;
  address: string;
  time: string;
  draw: number;
  prize: number;
  xexp: number;
}

const enum Tabs {
  WINNER = 'winner',
  EXP = 'exp',
  LUCKY = 'lucky',
}

const Ranking = () => {
  const [prizeRanking, setPrizeRanking] = useState<RankingItem[]>([]);
  const [expRanking, setExpRanking] = useState<RankingItem[]>([]);
  const [luckyRanking, setLuckyRanking] = useState<RankingItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.LUCKY);
  const chainId = useAtomValue(chainAtom);

  const loadWinnerRanking = useCallback(async () => {
    const ranking = await getWinnerRanking();
    setPrizeRanking(
      ranking.map((item, idx) => ({
        rank: idx + 1,
        address: item.player,
        time: formatTime(item.blockTimestamp * 1000),
        draw: item.inputUsdValue,
        prize: item.outputUsdValue,
        xexp: item.xexpAmount,
      }))
    );
  }, []);

  const loadLuckyRanking = useCallback(async () => {
    const ranking = await getLuckyRanking();
    setLuckyRanking(
      ranking.map((item, idx) => ({
        rank: idx + 1,
        address: item.player,
        time: formatTime(item.blockTimestamp * 1000),
        draw: item.inputUsdValue,
        prize: item.outputUsdValue,
        xexp: item.xexpAmount,
      }))
    );
  }, []);

  const loadExpRanking = useCallback(async () => {
    const ranking = await getExpRanking();
    setExpRanking(
      ranking.map((item, idx) => ({
        rank: idx + 1,
        address: item.player,
        time: formatTime(item.blockTimestamp * 1000),
        draw: item.inputUsdValue,
        prize: item.outputUsdValue,
        xexp: item.xexpAmount,
      }))
    );
  }, []);

  const handleChangeTab = useCallback(
    (tab: Tabs) => {
      if (activeTab === tab) return;
      setActiveTab(tab);
      if (tab === Tabs.WINNER) {
        loadWinnerRanking();
      } else if (tab === Tabs.EXP) {
        loadExpRanking();
      } else {
        loadLuckyRanking();
      }
    },
    [activeTab, loadExpRanking, loadLuckyRanking, loadWinnerRanking]
  );

  useEffect(() => {
    loadWinnerRanking();
    loadExpRanking();
    loadLuckyRanking();
  }, [loadExpRanking, loadWinnerRanking, chainId, loadLuckyRanking]);

  const activeTabStyle = 'text-2xl max-sm:text-lg text-nowrap';
  const inActiveTabStyle =
    'text-xl font-normal max-sm:text-base cursor-pointer text-nowrap';
  const data =
    activeTab === Tabs.WINNER
      ? prizeRanking
      : activeTab === Tabs.LUCKY
        ? luckyRanking
        : expRanking;

  return (
    <div className="overflow-x-hidden">
      <PrizeBroadcast />

      <section className="rounded-2xl bg-white px-[50px] pb-9 max-sm:px-6">
        <p className="mt-[110px] flex items-center space-x-12 pt-6 text-mainV1 max-sm:mt-[83px] max-sm:space-x-10">
          <span
            className={
              activeTab === Tabs.LUCKY ? activeTabStyle : inActiveTabStyle
            }
            onClick={() => handleChangeTab(Tabs.LUCKY)}
          >
            Top ROI
          </span>
          <span
            className={
              activeTab === Tabs.WINNER ? activeTabStyle : inActiveTabStyle
            }
            onClick={() => handleChangeTab(Tabs.WINNER)}
          >
            Top Winners
          </span>
          <span
            className={
              activeTab === Tabs.EXP ? activeTabStyle : inActiveTabStyle
            }
            onClick={() => handleChangeTab(Tabs.EXP)}
          >
            Top EXP
          </span>
        </p>
        <div className="max-sm:overflow-x-auto">
          <table className="min-w-full border-separate text-left text-dark3 max-sm:min-w-[768px] md:border-spacing-y-5">
            <thead>
              <tr className="max-sm:text-base">
                <th className="w-1/12 font-normal">Rank</th>
                <th className="w-3/12 font-normal max-sm:w-1/6">
                  User Address
                </th>
                <th className="w-1/6 font-normal">Prize(USD)</th>
                <th className="w-1/6 font-normal">Payout Ratio</th>
                <th className="w-1/6 font-normal">EXP</th>
                <th className="w-1/6 font-normal">Draw Amount(USD)</th>
              </tr>
            </thead>
            <tbody className="max-sm:text-sm">
              {data.map(({ address, rank, draw, prize, xexp }, idx) => {
                return (
                  <tr key={`${address}-${rank}-${idx}`}>
                    <td className="text-black">{rank}</td>
                    <td className="flex items-center">
                      <span className="w-10">
                        <img
                          className="inline-box h-auto w-full rounded"
                          src={getUserAvatar(address)}
                          alt={address}
                        ></img>
                      </span>
                      <span>{readableAddr(address, 4)}</span>
                    </td>
                    <td className="text-warning">{formatUSD(prize)}</td>
                    <td className="text-warning">
                      {((prize / draw) * 100).toFixed(2)}%
                    </td>
                    <td className="text-black">{xexp}</td>
                    <td className="text-black">{draw}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Ranking;
